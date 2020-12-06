import { ApiTestTools, TestAgent } from '../__testTools__/ApiTestTools';
import { HealthCheckSummaryResponse } from '../api-types';

describe('Public API /healthcheck', () => {
  describe('GET /healthcheck', () => {
    test('should return expected body with 200 status', async () => {
      const agent = createTestAgent();
      const response = await agent.get('/healthcheck').send();
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.body).toEqual<HealthCheckSummaryResponse>({
        version: expect.stringMatching(/^[0-9]+\.[0-9]+\.[0-9]+/u),
        buildInfo: expect.objectContaining({
          commitSha: expect.stringContaining(''),
          buildDate: expect.stringContaining(''),
          gitRef: expect.stringContaining(''),
        }),
      });
    });
  });
});

function createTestAgent(): TestAgent {
  return ApiTestTools.createTestAgent();
}
