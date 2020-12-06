import { ApiTestTools, TestAgent } from '../__testTools__/ApiTestTools';
import { BasicBuildInfo } from '../api-types';

describe('/examples', () => {
  describe('GET /examples/basic/basic', () => {
    test('should return a 200 status code', async () => {
      const agent = createTestAgent();
      const response = await agent.get('/examples/basic/basic').send();
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');

      const body = response.body as BasicBuildInfo;
      expect(body.protocol).toBe('https://catlight.io/protocol/v1.0/basic');
    });
  });

  describe('GET /examples/basic/multi-space', () => {
    test('should return a 200 status code', async () => {
      const agent = createTestAgent();
      const response = await agent.get('/examples/basic/multi-space').send();
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');

      const body = response.body as BasicBuildInfo;
      expect(body.protocol).toBe('https://catlight.io/protocol/v1.0/basic');
    });
  });
});

function createTestAgent(): TestAgent {
  return ApiTestTools.createTestAgent();
}
