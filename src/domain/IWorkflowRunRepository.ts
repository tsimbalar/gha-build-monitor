import { RepoName } from './IRepoRepository';

export type WorkflowRunStatus =
  | 'Queued'
  | 'Running'
  | 'Succeeded'
  | 'PartiallySucceeded'
  | 'Failed'
  | 'Canceled';

export interface WorkflowRun {
  readonly id: string;
  readonly name?: string;
  readonly webUrl: string;
  readonly status: WorkflowRunStatus;

  readonly startTime: Date;

  readonly finishTime?: Date;
}

export interface WorflowRunFilter {
  readonly maxAgeInDays: number;
  readonly maxRunsPerBranch: number;
}

export type WorkflowRunsPerBranch = ReadonlyMap<string, ReadonlyArray<WorkflowRun>>;
export interface IWorkflowRunRepository {
  getLatestRunsForWorkflow(
    token: string,
    repoName: RepoName,
    workflowId: string,
    filter: WorflowRunFilter
  ): Promise<WorkflowRunsPerBranch>;
}
