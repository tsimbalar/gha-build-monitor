/* eslint-disable camelcase */
import {
  IWorkflowRunRepository,
  WorflowRunFilter,
  WorkflowRun,
  WorkflowRunStatus,
  WorkflowRunsPerBranch,
} from '../../domain/IWorkflowRunRepository';
import { OctokitFactory } from './OctokitFactory';
import { RepoName } from '../../domain/IRepoRepository';
import { parseISO } from 'date-fns';

export class WorkflowRunRepository implements IWorkflowRunRepository {
  public constructor(private readonly octokitFactory: OctokitFactory) {}

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
        const runStartTime = parseISO(run.created_at);

        if (runStartTime <= nDaysAgo) {
          // stop right now because older than maxAgeDays
          shouldAskMorePages = false;
          // eslint-disable-next-line no-continue
          continue;
        }

        const currentForBranch = result.get(run.head_branch) || [];

        if (currentForBranch.length >= filter.maxRunsPerBranch) {
          // skipping this run because we already have enough builds for this branch
          // eslint-disable-next-line no-continue
          continue;
        }

        const status = this.parseWorkflowRunStatus(run.status, run.conclusion);
        const workflowRun: WorkflowRun = {
          id: run.id.toString(),
          webUrl: run.html_url,
          name: `${run.event}`,
          startTime: parseISO(run.created_at),
          status,
          finishTime: parseISO(run.updated_at),
        };

        result.set(run.head_branch, [workflowRun, ...currentForBranch]);
      }

      if (!shouldAskMorePages) {
        break;
      }
    }

    return result;
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
