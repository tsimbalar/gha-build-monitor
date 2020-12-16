import {
  BasicBuildInfoResponse,
  DynamicBuildInfoMetadataResponse,
  DynamicFilteredBuildInfoRequest,
} from '../api-types';
import { Body, Controller, Get, Post, Response, Route } from '@tsoa/runtime';
import { ValidationErrorJson } from '../middleware/schema-validation';

@Route('examples')
export class ExampleController extends Controller {
  @Get('basic/basic')
  public async getBasicExample(): Promise<BasicBuildInfoResponse> {
    // from https://github.com/catlightio/catlight-protocol/edit/master/Samples/basic/basic.json
    return {
      protocol: 'https://catlight.io/protocol/v1.0/basic',
      id: 'myAwesomeServer/12345678-1234-4567-abcd-123456789abc',
      webUrl: 'http://myserver.example/dashboard',
      name: 'My Server',
      currentUser: {
        id: 'tim95',
        name: 'Tim Drake',
      },
      spaces: [
        {
          id: 'super-project',
          name: 'Super Project',
          webUrl: 'http://myserver.example/super-project',
          buildDefinitions: [
            {
              id: 'nightly-build',
              name: 'Nightly Integration Build',
              webUrl: 'http://myserver.example/super-project/nightly-build/view',
              folder: 'build folder/subfolder',
              branches: [
                {
                  id: 'develop',
                  builds: [
                    {
                      id: '100',
                      webUrl: 'http://myserver.example/super-project/nightly-build/100',
                      status: 'Succeeded',
                      startTime: new Date(Date.parse('2017-01-25T17:30:10.000Z')),
                      finishTime: new Date(Date.parse('2017-01-25T17:30:20.000Z')),
                      triggeredByUser: {
                        id: 'tim95',
                        name: 'Tim Drake',
                      },
                      contributors: [
                        {
                          id: 'jgordon',
                          name: 'James Gordon',
                        },
                      ],
                    },
                    {
                      id: '101',
                      webUrl: 'http://myserver.example/super-project/nightly-build/101',
                      status: 'Running',
                      startTime: new Date(Date.parse('2017-01-25T17:40:10.000Z')),
                      triggeredByUser: {
                        id: 'jgordon',
                        name: 'James Gordon',
                      },
                    },
                  ],
                },
                {
                  id: 'features/new-searchlight',
                  builds: [
                    {
                      id: '300',
                      webUrl: 'http://myserver.example/super-project/nightly-build/300',
                      status: 'Succeeded',
                      startTime: new Date(Date.parse('2017-01-25T16:30:10.000Z')),
                      finishTime: new Date(Date.parse('2017-01-25T16:30:20.000Z')),
                      triggeredByUser: {
                        id: 'tim95',
                        name: 'Tim Drake',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  @Get('basic/multi-space')
  public async getBasicMultispaceExample(): Promise<BasicBuildInfoResponse> {
    // from https://github.com/catlightio/catlight-protocol/blob/master/Samples/basic/multi-space.json
    return {
      protocol: 'https://catlight.io/protocol/v1.0/basic',
      id: 'myAwesomeServer/12345678-1234-4567-abcd-123456789abc',
      webUrl: 'http://myserver.example/dashboard',
      name: 'My Server',
      currentUser: {
        id: 'tim95',
        name: 'Tim Drake',
      },
      spaces: [
        {
          id: 'super-project',
          name: 'Super Project',
          webUrl: 'http://myserver.example/super-project',
          buildDefinitions: [
            {
              id: 'nightly-build',
              name: 'Nightly Integration Build',
              webUrl: 'http://myserver.example/super-project/nightly-build/view',
              folder: 'build folder/subfolder',
              branches: [
                {
                  id: 'develop',
                  builds: [
                    {
                      id: '100',
                      webUrl: 'http://myserver.example/super-project/nightly-build/100',
                      status: 'Succeeded',
                      startTime: new Date(Date.parse('2017-01-25T17:30:10.000Z')),
                      finishTime: new Date(Date.parse('2017-01-25T17:30:20.000Z')),
                      triggeredByUser: {
                        id: 'tim95',
                        name: 'Tim Drake',
                      },
                      contributors: [
                        {
                          id: 'jgordon',
                          name: 'James Gordon',
                        },
                      ],
                    },
                    {
                      id: '101',
                      webUrl: 'http://myserver.example/super-project/nightly-build/101',
                      status: 'Running',
                      startTime: new Date(Date.parse('2017-01-25T17:40:10.000Z')),
                      triggeredByUser: {
                        id: 'jgordon',
                        name: 'James Gordon',
                      },
                    },
                  ],
                },
                {
                  id: 'features/new-searchlight',
                  builds: [
                    {
                      id: '300',
                      webUrl: 'http://myserver.example/super-project/nightly-build/300',
                      status: 'Succeeded',
                      startTime: new Date(Date.parse('2017-01-25T16:30:10.000Z')),
                      finishTime: new Date(Date.parse('2017-01-25T16:30:20.000Z')),
                      triggeredByUser: {
                        id: 'tim95',
                        name: 'Tim Drake',
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: 'second-build',
              name: 'Second Integration Build',
              webUrl: 'http://myserver.example/super-project/second-build/view',
              branches: [
                {
                  id: 'master',
                  builds: [
                    {
                      id: '600',
                      webUrl: 'http://myserver.example/super-project/second-build/600',
                      status: 'Failed',
                      startTime: new Date(Date.parse('2017-02-25T17:30:10.000Z')),
                      finishTime: new Date(Date.parse('2017-02-25T17:30:20.000Z')),
                      triggeredByUser: {
                        id: 'tim95',
                        name: 'Tim Drake',
                      },
                    },
                    {
                      id: '601',
                      webUrl: 'http://myserver.example/super-project/second-build/601',
                      status: 'Succeeded',
                      startTime: new Date(Date.parse('2017-02-25T17:40:10.000Z')),
                      finishTime: new Date(Date.parse('2017-02-25T17:45:20.000Z')),
                      triggeredByUser: {
                        id: 'tim95',
                        name: 'Tim Drake',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'second-project',
          name: 'Second Project',
          webUrl: 'http://myserver.example/second-project',
          buildDefinitions: [
            {
              id: 'daily-build',
              name: 'Daily Build',
              webUrl: 'http://myserver.example/second-project/daily-build/view',
              branches: [
                {
                  id: 'develop',
                  builds: [
                    {
                      id: '400',
                      webUrl: 'http://myserver.example/second-project/daily-build/400',
                      status: 'Succeeded',
                      startTime: new Date(Date.parse('2017-01-25T17:30:10.000Z')),
                      finishTime: new Date(Date.parse('2017-01-25T17:30:20.000Z')),
                      triggeredByUser: {
                        id: 'jgordon',
                        name: 'James Gordon',
                      },
                    },
                    {
                      id: '401',
                      webUrl: 'http://myserver.example/second-project/daily-build/401',
                      status: 'PartiallySucceeded',
                      startTime: new Date(Date.parse('2017-02-25T17:40:10.000Z')),
                      finishTime: new Date(Date.parse('2017-02-25T17:50:20.000Z')),
                      triggeredByUser: {
                        id: 'tim95',
                        name: 'Tim Drake',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  @Get('dynamic')
  public async getServerMetadata(): Promise<DynamicBuildInfoMetadataResponse> {
    // from https://github.com/catlightio/catlight-protocol/edit/master/Samples/dynamic/metadata-response.json
    return {
      protocol: 'https://catlight.io/protocol/v1.0/dynamic',
      id: 'myAwesomeServer/12345678-1234-4567-abcd-123456789abc',
      webUrl: 'http://myserver.example/dashboard',
      name: 'My Server',
      // TODO : check if this is correct
      // usePostRequestToGetState: true,
      currentUser: {
        id: 'tim95',
        name: 'Tim Drake',
      },
      spaces: [
        {
          id: 'super-project',
          name: 'Super Project',
          webUrl: 'http://myserver.example/super-project',

          buildDefinitions: [
            {
              id: 'nightly-build',
              name: 'Nightly Integration Build',
              webUrl: 'http://myserver.example/super-project/nightly-build/view',
              folder: 'build folder/subfolder',
            },
            {
              id: 'second-build',
              name: 'Second Build',
              webUrl: 'http://myserver.example/super-project/second-build/view',
            },
          ],
        },
      ],
    };
  }

  @Post('dynamic')
  @Response<ValidationErrorJson>(422, 'Validation error')
  public async getServerState(
    @Body() filters: DynamicFilteredBuildInfoRequest
  ): Promise<DynamicBuildInfoMetadataResponse> {
    // from https://github.com/catlightio/catlight-protocol/edit/master/Samples/dynamic/metadata-response.json
    return {
      protocol: 'https://catlight.io/protocol/v1.0/dynamic',
      id: 'myAwesomeServer/12345678-1234-4567-abcd-123456789abc',
      webUrl: 'http://myserver.example/dashboard',
      name: 'My Server',
      // TODO : check if this is correct
      // usePostRequestToGetState: true,
      currentUser: {
        id: 'tim95',
        name: 'Tim Drake',
      },
      spaces: [
        {
          id: 'super-project',
          name: 'Super Project',
          webUrl: 'http://myserver.example/super-project',

          buildDefinitions: [
            {
              id: 'nightly-build',
              name: 'Nightly Integration Build',
              webUrl: 'http://myserver.example/super-project/nightly-build/view',
              folder: 'build folder/subfolder',
            },
            {
              id: 'second-build',
              name: 'Second Build',
              webUrl: 'http://myserver.example/super-project/second-build/view',
            },
          ],
        },
      ],
    };
  }
}
