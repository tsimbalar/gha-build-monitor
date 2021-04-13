/* eslint-disable camelcase */
import {
  IWorkflowRunRepository,
  WorflowRunFilter,
  WorkflowRun,
  WorkflowRunAuthor,
  WorkflowRunStatus,
  WorkflowRunsPerBranch,
} from '../../domain/IWorkflowRunRepository';
import { ICommitAuthorRepository } from './CommitAuthorRepository';
import { Octokit } from '@octokit/rest';
import { OctokitFactory } from './OctokitFactory';
import { RepoName } from '../../domain/IRepoRepository';
import { parseISO } from 'date-fns';

export class WorkflowRunRepository implements IWorkflowRunRepository {
  public constructor(
    private readonly octokitFactory: OctokitFactory,
    private readonly commitAuthorRepo: ICommitAuthorRepository
  ) {}

  public async getLatestRunsForWorkflow(
    token: string,
    repoName: RepoName,
    workflowId: string,
    filter: WorflowRunFilter
  ): Promise<WorkflowRunsPerBranch> {
    const nDaysAgo = new Date();
    nDaysAgo.setDate(nDaysAgo.getDate() - filter.maxAgeInDays);

    const octokit = this.octokitFactory(token);

    const result = new Map<string, ReadonlyArray<WorkflowRun>>();

    let shouldAskMorePages = true;

    for await (const response of octokit.paginate.iterator(octokit.actions.listWorkflowRuns, {
      owner: repoName.owner,
      repo: repoName.name,
      workflow_id: workflowId,
    })) {
      for (const run of response.data) {
        const branchKey = this.getBranchKey(run);
        const runStartTime = parseISO(run.created_at);

        if (runStartTime <= nDaysAgo) {
          // stop right now because older than maxAgeDays
          shouldAskMorePages = false;
          // eslint-disable-next-line no-continue
          continue;
        }

        const currentForBranch = result.get(branchKey) || [];

        const isLatestRunInThisBranch = currentForBranch.length === 0;

        if (currentForBranch.length >= filter.maxRunsPerBranch) {
          // skipping this run because we already have enough builds for this branch
          // eslint-disable-next-line no-continue
          continue;
        }

        // ignore skipped workflows runs completely
        if (this.shouldIgnoreWorkflowRun(run.status, run.conclusion)) {
          // eslint-disable-next-line no-continue
          continue;
        }

        const status = this.parseWorkflowRunStatus(run.status, run.conclusion);
        let author: WorkflowRunAuthor | undefined;
        if (isLatestRunInThisBranch) {
          // eslint-disable-next-line no-await-in-loop
          const commitAuthor = await this.commitAuthorRepo.getAuthorForCommit(
            token,
            repoName,
            run.head_commit.id
          );

          if (commitAuthor) {
            author = {
              login: commitAuthor.login,
              name: commitAuthor.name ?? commitAuthor.login,
            };
          }
        }

        const workflowRun: WorkflowRun = {
          id: run.id.toString(),
          webUrl: run.html_url,
          name: run.name,
          startTime: parseISO(run.created_at),
          status,
          finishTime: parseISO(run.updated_at),
          event: run.event,
          mainAuthor: author,
        };

        result.set(branchKey, [workflowRun, ...currentForBranch]);
      }

      if (!shouldAskMorePages) {
        break;
      }
    }

    return result;
  }

  private getBranchKey(run: { head_branch: string; event: string }): string {
    if (run.event === 'push') {
      return run.head_branch;
    }
    if (run.event === 'pull_request') {
      return `PR#${run.head_branch}`;
    }
    return `${run.event}#${run.head_branch}`;
  }

  private shouldIgnoreWorkflowRun(runStatus: string, runConclusion: string): boolean {
    // when a workflow has only skipped jobs, don't even report it.
    return runStatus === 'completed' && runConclusion === 'skipped';
  }

  private parseWorkflowRunStatus(runStatus: string, runConclusion: string): WorkflowRunStatus {
    // eslint-disable-next-line default-case
    switch (runStatus) {
      case 'completed':
        if (runConclusion === 'success') {
          return 'Succeeded';
        }
        if (runConclusion === 'failure') {
          return 'Failed';
        }
        if (runConclusion === 'cancelled') {
          return 'Canceled';
        }
        if (runConclusion === 'startup_failure') {
          return 'Failed';
        }
        break;
      case 'in_progress':
        return 'Running';
      case 'queued':
        return 'Queued';
      case 'waiting':
        return 'Queued';
    }
    throw new Error(
      `Unsupported workflow run status/conclusion "${runStatus}" / "${runConclusion}"`
    );
  }
}
