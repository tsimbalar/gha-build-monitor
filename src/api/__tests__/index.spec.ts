/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApiTestTools, TEST_SETTINGS, TestAgent } from '../__testTools__/ApiTestTools';

describe('/', () => {
  describe('GET /', () => {
    test('should return an html page', async () => {
      const agent = ApiTestTools.createTestAgent();
      const response = await agent.get('/').send();
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });
  });
});
