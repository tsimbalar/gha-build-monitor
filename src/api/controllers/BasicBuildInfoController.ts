import * as catlight from '../catlight-protocol';
import * as express from 'express';
import { Controller, Get, Request, Route, Security } from '@tsoa/runtime';
import { BasicBuildInfoResponse } from '../api-types';
import { IRepoRepository } from '../../domain/IRepoRepository';

interface ServerInfo {
  readonly id: string;
  readonly name: string;
  readonly version: string;
}
@Route('basic')
export class BasicBuildInfoController extends Controller {
  public constructor(
    private readonly serverInfo: ServerInfo,
    private readonly repos: IRepoRepository
  ) {
    super();
  }

  @Get('')
  @Security('bearerAuth', ['repo'])
  public async getBasicBuildInfo(
    @Request() request: express.Request
  ): Promise<BasicBuildInfoResponse> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentUser = request.user!;
    const userResponse: catlight.User = { name: currentUser.name, id: currentUser.id };

    // const gitHubClient = this.githubFactory.getForToken(currentUser.token);

    // const reposResponse = await gitHubClient.repos.listForAuthenticatedUser({
    //   sort: 'full_name',
    //   direction: 'asc',
    // });

    // const spaces = reposResponse.data.

    const repos = await this.repos.listForToken(currentUser.token);

    return {
      protocol: 'https://catlight.io/protocol/v1.0/basic',
      id: this.serverInfo.id,
      name: this.serverInfo.name,
      serverVersion: this.serverInfo.version,
      webUrl: 'http://myserver.example/dashboard',
      currentUser: userResponse,
      spaces: repos.map((s) => ({
        id: s.id,
        name: s.name,
        webUrl: s.webUrl,
        buildDefinitions: [],
      })),
      // [
      // {
      //   id: 'super-project',
      //   name: 'Super Project',
      //   webUrl: 'http://myserver.example/super-project',
      //   buildDefinitions: [
      //     {
      //       id: 'nightly-build',
      //       name: 'Nightly Integration Build',
      //       webUrl: 'http://myserver.example/super-project/nightly-build/view',
      //       folder: 'build folder/subfolder',
      //       branches: [
      //         {
      //           id: 'develop',
      //           builds: [
      //             {
      //               id: '100',
      //               webUrl: 'http://myserver.example/super-project/nightly-build/100',
      //               status: 'Succeeded',
      //               startTime: new Date(Date.parse('2017-01-25T17:30:10.000Z')),
      //               finishTime: new Date(Date.parse('2017-01-25T17:30:20.000Z')),
      //               triggeredByUser: {
      //                 id: 'tim95',
      //                 name: 'Tim Drake',
      //               },
      //               contributors: [
      //                 {
      //                   id: 'jgordon',
      //                   name: 'James Gordon',
      //                 },
      //               ],
      //             },
      //             {
      //               id: '101',
      //               webUrl: 'http://myserver.example/super-project/nightly-build/101',
      //               status: 'Running',
      //               startTime: new Date(Date.parse('2017-01-25T17:40:10.000Z')),
      //               triggeredByUser: {
      //                 id: 'jgordon',
      //                 name: 'James Gordon',
      //               },
      //             },
      //           ],
      //         },
      //         {
      //           id: 'features/new-searchlight',
      //           builds: [
      //             {
      //               id: '300',
      //               webUrl: 'http://myserver.example/super-project/nightly-build/300',
      //               status: 'Succeeded',
      //               startTime: new Date(Date.parse('2017-01-25T16:30:10.000Z')),
      //               finishTime: new Date(Date.parse('2017-01-25T16:30:20.000Z')),
      //               triggeredByUser: {
      //                 id: 'tim95',
      //                 name: 'Tim Drake',
      //               },
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //   ],
      // },
      // ],
    };
  }
}
