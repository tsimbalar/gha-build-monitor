import { ApiTestTools, TestAgent } from '../__testTools__/ApiTestTools';
import { HealthCheckResponse, WhoAmIResponse } from '../api-types';
import { InMemoryUserRepository } from '../../infra/memory/InMemoryUserRepository';
import { UserWithScopes } from '../../domain/IUserRepository';

describe('Public API /_/* (diagnostics)', () => {
  let agent: TestAgent;
  let userRepo: InMemoryUserRepository;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    agent = ApiTestTools.createTestAgent({ userRepo });
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

    test('should return 401 status when token does not match known user', async () => {
      const response = await agent
        .get('/_/whoami')
        .set('Authorization', `Bearer some_token_from_somewhere`)
        .send();
      expect(response.status).toBe(401);
      expect(response.type).toBe('application/json');
    });

    test('should return expected body with 200 status when provided bearer token', async () => {
      const existingUser: UserWithScopes = {
        id: 'some_id',
        login: 'the_login',
        scopes: ['repo'],
      };
      const token = 'THIS-IS-A-TOKEN';
      userRepo.addUser(token, existingUser);
      const response = await agent.get('/_/whoami').set('Authorization', `Bearer ${token}`).send();
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.body).toEqual<WhoAmIResponse>({
        id: existingUser.id,
        name: existingUser.login,
        scopes: existingUser.scopes,
      });
    });
  });
});
