import * as catlightCore from '../../catlight-protocol/shared';
import * as catlightDynamic from '../../catlight-protocol/dynamic';
import * as express from 'express';
import { Controller, Get, Request, Route, Security } from '@tsoa/runtime';
import { IRepoRepository, Repo, Workflow } from '../../domain/IRepoRepository';
import { IWorkflowRunRepository, WorkflowRunsPerBranch } from '../../domain/IWorkflowRunRepository';
import { DynamicBuildInfoMetadataResponse } from '../api-types';

interface ServerInfo {
  readonly id: string;
  readonly name: string;
  readonly version: string;
}

@Route('dynamic')
export class DynamicBuildInfoController extends Controller {
  public constructor(
    private readonly serverInfo: ServerInfo,
    private readonly repos: IRepoRepository,
    private readonly workflowRuns: IWorkflowRunRepository
  ) {
    super();
  }

  @Get('')
  @Security('bearerAuth', ['repo'])
  public async getMetadata(
    @Request() request: express.Request
  ): Promise<DynamicBuildInfoMetadataResponse> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentUser = request.user!;
    const userResponse: catlightCore.User = { name: currentUser.name, id: currentUser.id };

    const repos = await this.repos.listForToken(currentUser.token);

    return {
      protocol: 'https://catlight.io/protocol/v1.0/dynamic',
      id: this.serverInfo.id,
      name: this.serverInfo.name,
      serverVersion: this.serverInfo.version,
      webUrl: 'http://myserver.example/dashboard',
      currentUser: userResponse,
      spaces: repos.map((repo) => ({
        id: repo.id,
        name: repo.name.fullName,
        webUrl: repo.webUrl,
        buildDefinitions: repo.workflows.map((wf) => this.mapToBuildDefinition(repo, wf)),
      })),
    };
  }

  private mapToBuildDefinition(
    repo: Repo,
    workflow: Workflow
  ): catlightDynamic.BuildDefinitionMetadata {
    return {
      id: workflow.id,
      name: workflow.name,
      folder: repo.name.fullName,
      webUrl: workflow.webUrl,
    };
  }
}
