import {
  ServerMetadata,
  ServerStateRequest,
  ServerStateResponse,
} from '../catlight-protocol/dynamic';

export type DynamicBuildInfoMetadataResponse = ServerMetadata;
export type DynamicFilteredBuildInfoRequest = ServerStateRequest;
export type DynamicFilteredBuildInfoResponse = ServerStateResponse;

export interface HealthCheckResponse {
  readonly version: string;
  readonly buildInfo: { [key: string]: string };
}

export interface WhoAmIResponse {
  readonly login: string;
  readonly name: string | null;
  readonly scopes: string[];
}
