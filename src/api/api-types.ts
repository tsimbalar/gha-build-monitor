import { Server } from './catlight-protocol';

export type BasicBuildInfoResponse = Server;

export interface HealthCheckResponse {
  readonly version: string;
  readonly buildInfo: { [key: string]: string };
}

export interface WhoAmIResponse {
  readonly id: string;
  readonly name: string;
  readonly scopes: string[];
}
