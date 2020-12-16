import {
  ServerMetadata,
  ServerStateRequest,
  ServerStateResponse,
} from '../catlight-protocol/dynamic';
import { Server } from '../catlight-protocol/basic';

export type BasicBuildInfoResponse = Server;
export type DynamicBuildInfoMetadataResponse = ServerMetadata;
export type DynamicFilteredBuildInfoRequest = ServerStateRequest;
export type DynamicFilteredBuildInfoResponse = ServerStateResponse;

export interface HealthCheckResponse {
  readonly version: string;
  readonly buildInfo: { [key: string]: string };
}

export interface WhoAmIResponse {
  readonly id: string;
  readonly name: string;
  readonly scopes: string[];
}
