import { Octokit } from '@octokit/rest';

export type OctokitFactory = (token: string) => Octokit;

export const octokitFactory: OctokitFactory = (token) => new Octokit({ auth: token });
