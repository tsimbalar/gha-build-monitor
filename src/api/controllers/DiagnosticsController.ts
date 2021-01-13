import * as express from 'express';
import { Controller, Get, Request, Route, Security } from '@tsoa/runtime';
import { HealthCheckResponse, WhoAmIResponse } from '../api-types';
import type { MetaInfo } from '../../meta';

@Route('')
export class DiagnosticsController extends Controller {
  public constructor(private readonly metaInfo: MetaInfo) {
    super();
  }

  /**
   * Gets an indication of the current health of the system
   */
  @Get('_/healthcheck')
  public getHealthCheck(): HealthCheckResponse {
    return {
      version: this.metaInfo.version,
      buildInfo: this.metaInfo.buildInfo,
    };
  }

  /**
   * Gets an indication of the current health of the system
   */
  @Security('bearerAuth')
  @Get('_/whoami')
  public getMe(@Request() request: express.Request): WhoAmIResponse {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentUser = request.user!;
    return {
      name: currentUser.name,
      login: currentUser.login,
      scopes: currentUser.tokenScopes,
    };
  }
}
