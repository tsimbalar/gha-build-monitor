import { Controller, Get, Route } from '@tsoa/runtime';
import { HealthCheckSummaryResponse } from '../api-types';
import type { MetaInfo } from '../../meta';

@Route('/healthcheck')
export class HealthCheckController extends Controller {
  public constructor(private readonly metaInfo: MetaInfo) {
    super();
  }

  /**
   * Gets an indication of the current health of the system
   */
  @Get()
  public get(): HealthCheckSummaryResponse {
    return {
      version: this.metaInfo.version,
      buildInfo: this.metaInfo.buildInfo,
    };
  }
}
