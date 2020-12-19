import * as catlightBasic from '../../catlight-protocol/basic';
import * as catlightCore from '../../catlight-protocol/shared';
import * as express from 'express';
import { Controller, Get, Request, Route, Security } from '@tsoa/runtime';
import { IRepoRepository, Repo, Workflow } from '../../domain/IRepoRepository';
import {
  IWorkflowRunRepository,
  WorkflowRun,
  WorkflowRunsPerBranch,
} from '../../domain/IWorkflowRunRepository';
import { BasicBuildInfoResponse } from '../api-types';

interface ServerInfo {
  readonly id: string;
  readonly name: string;
  readonly version: string;
}

interface WorkflowAndRuns {
  readonly workflow: Workflow;
  readonly runs: WorkflowRunsPerBranch;
}
@Route('basic')
export class BasicBuildInfoController extends Controller {
  public constructor(
    private readonly serverInfo: ServerInfo,
    private readonly repos: IRepoRepository,
    private readonly workflowRuns: IWorkflowRunRepository
  ) {
    super();
  }

  @Get('')
  @Security('bearerAuth', ['repo'])
  public async getBasicBuildInfo(
    @Request() request: express.Request
  ): Promise<BasicBuildInfoResponse> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentUser = request.user!;
    const userResponse: catlightCore.User = {
      name: currentUser.name ?? currentUser.login,
      id: currentUser.id,
    };

    const repos = await this.repos.listForToken(currentUser.token);
    const allWorkflowRuns = await this.getAllWorkflowRuns(currentUser.token, repos);

    return {
      protocol: 'https://catlight.io/protocol/v1.0/basic',
      id: this.serverInfo.id,
      name: this.serverInfo.name,
      serverVersion: this.serverInfo.version,
      webUrl: 'http://myserver.example/dashboard',
      currentUser: userResponse,
      spaces: repos.map((repo) => ({
        id: repo.id,
        name: repo.name.fullName,
        webUrl: repo.webUrl,
        buildDefinitions: (allWorkflowRuns.get(repo.name.fullName) || []).map((item) =>
          this.mapToBuildDefinition(repo, item)
        ),
      })),
    };
  }

  private async getAllWorkflowRuns(
    token: string,
    repos: readonly Repo[]
  ): Promise<Map<string, ReadonlyArray<WorkflowAndRuns>>> {
    const getAllWorkflows = repos
      .map((repo) => {
        const workflows = repo.workflows;
        return workflows.map(async (wf) => {
          const runs = await this.workflowRuns.getLatestRunsForWorkflow(token, repo.name, wf.id, {
            maxAgeInDays: 3,
            maxRunsPerBranch: 5,
          });
          return {
            repo,
            workflow: wf,
            runs,
          };
        });
      })
      .flatMap((x) => x);
    const all = await Promise.all(getAllWorkflows);

    const result = new Map<string, ReadonlyArray<WorkflowAndRuns>>();
    for (const item of all) {
      const { repo, ...workflowAndRuns } = item;
      const repoKey = repo.name.fullName;
      const existing = result.get(repoKey) || [];

      const updated = [...existing, workflowAndRuns];

      result.set(repoKey, updated);
    }
    return result;
  }

  private mapToBuildDefinition(
    repo: Repo,
    workflowAndRuns: WorkflowAndRuns
  ): catlightBasic.BuildDefinition {
    const workflow = workflowAndRuns.workflow;
    const runsPerBranch = workflowAndRuns.runs;
    return {
      id: workflow.id,
      name: workflow.name,
      folder: repo.name.fullName,
      webUrl: workflow.webUrl,
      branches: this.mapToBuildBranches(runsPerBranch),
    };
  }

  private mapToBuildBranches(runsPerBranch: WorkflowRunsPerBranch): catlightCore.BuildBranch[] {
    return [...runsPerBranch.entries()].map<catlightCore.BuildBranch>(([branchName, runs]) => ({
      id: branchName,
      builds: runs.map((r) => this.mapToBuild(r)),
    }));
  }

  private mapToBuild(run: WorkflowRun): catlightCore.Build {
    return {
      id: run.id,
      startTime: run.startTime,
      status: run.status,
      finishTime: run.finishTime,
      name: run.name,
      webUrl: run.webUrl,
      // TODO: contributors, triggeredByUser
    };
  }
}
