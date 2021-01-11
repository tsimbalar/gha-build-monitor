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
import { MetaInfo } from '../../meta';
import { ValidationErrorJson } from '../middleware/schema-validation';

@Route('dynamic')
export class DynamicBuildInfoController extends Controller {
  private readonly realController: BuildInfoController;

  public constructor(
    metaInfo: MetaInfo,
    repos: IRepoRepository,
    workflowRuns: IWorkflowRunRepository
  ) {
    super();
    this.realController = new BuildInfoController(metaInfo, repos, workflowRuns);
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
