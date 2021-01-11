import { ApiTestTools, TestAgent } from '../__testTools__/ApiTestTools';
import {
  DynamicBuildInfoMetadataResponse,
  DynamicFilteredBuildInfoRequest,
  DynamicFilteredBuildInfoResponse,
} from '../api-types';

describe('/examples', () => {
  describe('GET /examples/dynamic', () => {
    test('should return a 200 status code', async () => {
      const agent = createTestAgent();
      const response = await agent.get('/examples/dynamic').send();
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');

      const body = response.body as DynamicBuildInfoMetadataResponse;
      expect(body.protocol).toBe('https://catlight.io/protocol/v1.0/dynamic');
    });
  });

  describe('POST /examples/dynamic', () => {
    test('should accept filter payload return a 200 status code', async () => {
      const agent = createTestAgent();
      // take from https://github.com/catlightio/catlight-protocol/blob/master/Samples/dynamic/state-request.json
      const requestBody: DynamicFilteredBuildInfoRequest = {
        id: 'myAwesomeServer/12345678-1234-4567-abcd-123456789abc',
        spaces: [
          {
            id: 'owner/repo',
            buildDefinitions: [
              {
                id: 'nightly-build',
              },
            ],
          },
        ],
      };
      const response = await agent.post('/examples/dynamic').send(requestBody);
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');

      const body = response.body as DynamicFilteredBuildInfoResponse;
      expect(body.protocol).toBe('https://catlight.io/protocol/v1.0/dynamic');
    });
  });
});

function createTestAgent(): TestAgent {
  return ApiTestTools.createTestAgent();
}
