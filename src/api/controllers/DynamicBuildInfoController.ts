import * as catlightDynamic from '../../catlight-protocol/dynamic';
import * as express from 'express';
import {
  Body,
  Controller,
  Deprecated,
  Get,
  Post,
  Request,
  Response,
  Route,
  Security,
} from '@tsoa/runtime';
import {
  DynamicBuildInfoMetadataResponse,
  DynamicFilteredBuildInfoRequest,
  DynamicFilteredBuildInfoResponse,
} from '../api-types';
import { BuildInfoController } from './BuildInfoController';
import { IRepoRepository } from '../../domain/IRepoRepository';
import { IWorkflowRunRepository } from '../../domain/IWorkflowRunRepository';
import { ValidationErrorJson } from '../middleware/schema-validation';

interface ServerInfo {
  readonly id: string;
  readonly name: string;
  readonly version: string;
}

@Route('dynamic')
export class DynamicBuildInfoController extends Controller {
  private readonly realController: BuildInfoController;

  public constructor(
    private readonly serverInfo: ServerInfo,
    private readonly repos: IRepoRepository,
    private readonly workflowRuns: IWorkflowRunRepository
  ) {
    super();
    this.realController = new BuildInfoController(serverInfo, repos, workflowRuns);
  }

  @Deprecated()
  @Get('')
  @Security('bearerAuth', ['repo'])
  public async getMetadata(
    @Request() request: express.Request
  ): Promise<DynamicBuildInfoMetadataResponse> {
    return this.realController.getMetadata(request);
  }

  @Deprecated()
  @Post('')
  @Security('bearerAuth', ['repo'])
  @Response<ValidationErrorJson>(422, 'Validation error')
  public async getServerState(
    @Request() request: express.Request,
    @Body() filters: DynamicFilteredBuildInfoRequest
  ): Promise<DynamicFilteredBuildInfoResponse> {
    return this.realController.getServerState(request, filters);
  }
}
