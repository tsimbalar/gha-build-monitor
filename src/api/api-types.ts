import { Server } from './catlight-protocol';

export type BasicBuildInfo = Server;

export interface HealthCheckSummaryResponse {
  readonly version: string;
  readonly buildInfo: { [key: string]: string };
}
