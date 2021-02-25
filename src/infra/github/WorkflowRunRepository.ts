/* eslint-disable camelcase */
import {
  IWorkflowRunRepository,
  WorflowRunFilter,
  WorkflowRun,
  WorkflowRunAuthor,
  WorkflowRunStatus,
  WorkflowRunsPerBranch,
} from '../../domain/IWorkflowRunRepository';
import { BaseCommitAuthorRepository } from './CommitAuthorRepository';
import { OctokitFactory } from './OctokitFactory';
import { RepoName } from '../../domain/IRepoRepository';
import { parseISO } from 'date-fns';

interface WorkflowRunInfo {
  readonly id: string;
  readonly name?: string;
  readonly webUrl: string;
  readonly runStatus: string;
  readonly runConclusion: string;
  readonly event: string;
  readonly startTime: Date;
  readonly finishTime?: Date;
  readonly commitId: string;
}

export class WorkflowRunRepository implements IWorkflowRunRepository {
  public constructor(
    private readonly octokitFactory: OctokitFactory,
    private readonly commitAuthorRepo: BaseCommitAuthorRepository
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

    const result = new Map<string, ReadonlyArray<WorkflowRunInfo>>();

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

        if (currentForBranch.length >= filter.maxRunsPerBranch) {
          // skipping this run because we already have enough builds for this branch
          // eslint-disable-next-line no-continue
          continue;
        }

        const workflowRun: WorkflowRunInfo = {
          id: run.id.toString(),
          webUrl: run.html_url,
          name: run.name,
          startTime: parseISO(run.created_at),
          runStatus: run.status,
          runConclusion: run.conclusion,
          finishTime: parseISO(run.updated_at),
          event: run.event,
          commitId: run.head_commit.id,
        };

        result.set(branchKey, [workflowRun, ...currentForBranch]);
      }

      if (!shouldAskMorePages) {
        break;
      }
    }

    const mappedResults = await this.mapToWorkflowRunsPerBranch(token, repoName, result);

    return mappedResults;
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

  private async mapToWorkflowRunsPerBranch(
    token: string,
    repoName: RepoName,
    input: Map<string, ReadonlyArray<WorkflowRunInfo>>
  ): Promise<WorkflowRunsPerBranch> {
    const lastCommitForEachRunInBranch = [
      ...new Set([...input.values()].map((runs) => runs[0].commitId)),
    ];
    const commitAuthorsPerCommitId = await this.commitAuthorRepo.getAuthorsForCommits(
      token,
      repoName,
      lastCommitForEachRunInBranch
    );

    return new Map<string, readonly WorkflowRun[]>(
      [...input.entries()].map(([k, v]) => [
        k,
        v.map<WorkflowRun>((info) => {
          let author: WorkflowRunAuthor | undefined;
          const commitAuthor = commitAuthorsPerCommitId.get(info.commitId);
          if (commitAuthor) {
            author = {
              login: commitAuthor.login,
              name: commitAuthor.name ?? commitAuthor.login,
            };
          }

          return {
            event: info.event,
            id: info.id,
            startTime: info.startTime,
            webUrl: info.webUrl,
            finishTime: info.finishTime,
            name: info.name,
            status: this.parseWorkflowRunStatus(info.runStatus, info.runConclusion),
            mainAuthor: author,
          };
        }),
      ])
    );
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
        if (runConclusion === 'skipped') {
          return 'Canceled';
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
    }
    throw new Error(
      `Unsupported workflow run status/conclusion "${runStatus}" / "${runConclusion}"`
    );
  }
}
