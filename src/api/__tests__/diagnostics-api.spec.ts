import { ApiTestTools, TestAgent } from '../__testTools__/ApiTestTools';
import { HealthCheckResponse, WhoAmIResponse } from '../api-types';

// Personal Access Token with no scope
const MINIMAL_PRIVILEGE_GITHUB_TOKEN = 'b98fcc278378051761414236ad1c5a2a741cd313';

describe('Public API /_/* (diagnostics)', () => {
  let agent: TestAgent;

  beforeEach(() => {
    agent = ApiTestTools.createTestAgent();
  });

  describe('GET /_/healthcheck', () => {
    test('should return expected body with 200 status', async () => {
      const response = await agent.get('/_/healthcheck').send();
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.body).toEqual<HealthCheckResponse>({
        version: expect.stringMatching(/^[0-9]+\.[0-9]+\.[0-9]+/u),
        buildInfo: expect.objectContaining({
          commitSha: expect.stringContaining(''),
          buildDate: expect.stringContaining(''),
          gitRef: expect.stringContaining(''),
        }),
      });
    });
  });

  describe('GET /_/whoami', () => {
    test('should return 401 status when missing token', async () => {
      const response = await agent.get('/_/whoami').send();
      expect(response.status).toBe(401);
      expect(response.type).toBe('application/json');
    });

    test('should return expected body with 200 status when provided bearer token', async () => {
      const response = await agent
        .get('/_/whoami')
        .set('Authorization', `Bearer ${MINIMAL_PRIVILEGE_GITHUB_TOKEN}`)
        .send();
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.body).toEqual<WhoAmIResponse>({
        id: '160544',
        name: 'tsimbalar',
      });
    });
  });
});
