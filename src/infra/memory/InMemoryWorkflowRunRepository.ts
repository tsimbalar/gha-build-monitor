import {
  IWorkflowRunRepository,
  WorflowRunFilter,
  WorkflowRun,
  WorkflowRunsPerBranch,
} from '../../domain/IWorkflowRunRepository';
import { RepoName } from '../../domain/IRepoRepository';

export class InMemoryWorkflowRunRepository implements IWorkflowRunRepository {
  private readonly runsPerRepoAndWorkflow: Map<string, WorkflowRunsPerBranch> = new Map();

  public addRuns(
    repoName: RepoName,
    workflowId: string,
    branch: string,
    runs: WorkflowRun[]
  ): void {
    const storageKey = this.getStorageKey(repoName, workflowId);
    const current = this.runsPerRepoAndWorkflow.get(storageKey) || new Map<string, WorkflowRun[]>();

    const updated = new Map(current.entries());
    updated.set(branch, runs);
    this.runsPerRepoAndWorkflow.set(storageKey, updated);
  }

  public async getLatestRunsForWorkflow(
    token: string,
    repoName: RepoName,
    workflowId: string,
    filter: WorflowRunFilter
  ): Promise<WorkflowRunsPerBranch> {
    const storageKey = this.getStorageKey(repoName, workflowId);
    const runs = this.runsPerRepoAndWorkflow.get(storageKey) || new Map<string, WorkflowRun[]>();

    return runs;
  }

  private getStorageKey(repoName: RepoName, workflowId: string): string {
    return `${repoName.fullName}-${workflowId}`;
  }
}
