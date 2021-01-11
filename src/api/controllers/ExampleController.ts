import { Body, Controller, Get, Post, Response, Route } from '@tsoa/runtime';
import { DynamicBuildInfoMetadataResponse, DynamicFilteredBuildInfoRequest } from '../api-types';
import { ValidationErrorJson } from '../middleware/schema-validation';

@Route('examples')
export class ExampleController extends Controller {
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
