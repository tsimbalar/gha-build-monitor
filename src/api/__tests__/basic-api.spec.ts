import { ApiTestTools, TEST_SETTINGS, TestAgent } from '../__testTools__/ApiTestTools';
import { BasicBuildInfoResponse } from '../api-types';
import { InMemoryRepoRepository } from '../../infra/memory/InMemoryRepoRepository';
import { InMemoryUserRepository } from '../../infra/memory/InMemoryUserRepository';
import { Repo } from '../../domain/IRepoRepository';
import { User } from '../../domain/IUserRepository';

describe('/basic', () => {
  describe('GET /basic', () => {
    test('should return a 401 status code when missing bearer token', async () => {
      const agent = ApiTestTools.createTestAgent();
      const response = await agent.get('/basic').send();
      expect(response.status).toBe(401);
      expect(response.type).toBe('application/json');
    });

    test('should return a 403 status code when token misses "repo" scope', async () => {
      const token = 'THIS_IS_THE_TOKEN';
      const user: User = { id: 'USER_ID', login: 'USER_LOGIN', scopes: [] };
      const userRepo = new InMemoryUserRepository();
      userRepo.addUser(token, user);

      const agent = ApiTestTools.createTestAgent({ userRepo });

      const response = await agent.get('/basic').set('Authorization', `Bearer ${token}`).send();
      expect(response.status).toBe(403);
      expect(response.type).toBe('application/json');
    });

    describe('with token of existing user', () => {
      const token = 'THIS_IS_THE_TOKEN';
      const user: User = { id: 'USER_ID', login: 'USER_LOGIN', scopes: ['repo'] };
      const installationId = 'THE_INSTALLATION_ID';
      let agent: TestAgent;
      let repoRepo: InMemoryRepoRepository;

      beforeEach(() => {
        const userRepo = new InMemoryUserRepository();
        userRepo.addUser(token, user);

        repoRepo = new InMemoryRepoRepository();

        agent = ApiTestTools.createTestAgent(
          { userRepo, repoRepo },
          {
            ...TEST_SETTINGS,
            catlight: { ...TEST_SETTINGS.catlight, installationId },
          }
        );
      });

      test('should return a 200 status code', async () => {
        const response = await agent.get('/basic').set('Authorization', `Bearer ${token}`).send();
        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');

        const body = response.body as BasicBuildInfoResponse;
        expect(body.protocol).toBe('https://catlight.io/protocol/v1.0/basic');
      });

      test('should identify server as gha-build-monitor', async () => {
        const response = await agent.get('/basic').set('Authorization', `Bearer ${token}`).send();

        const body = response.body as BasicBuildInfoResponse;
        expect(body.id).toMatch(/^gha-build-monitor.*/u);
        expect(body.name).toEqual('gha-build-monitor');
        expect(body.serverVersion).toMatch(/[0-9]+.[0-9]+.[0-9]+/u);
      });

      test('should have installationId in server id', async () => {
        const response = await agent.get('/basic').set('Authorization', `Bearer ${token}`).send();

        const body = response.body as BasicBuildInfoResponse;
        expect(body.id).toMatch(RegExp(`${installationId}$`, 'u'));
      });

      test('should return current user information', async () => {
        const response = await agent.get('/basic').set('Authorization', `Bearer ${token}`).send();

        const body = response.body as BasicBuildInfoResponse;
        expect(body.currentUser).toEqual({ id: user.id, name: user.login });
      });

      test('should return spaces of user', async () => {
        const repos: Repo[] = [
          { id: '123', name: 'orgx/repoz', webUrl: '', workflows: [] },
          { id: '456', name: 'org1/repoB', webUrl: '', workflows: [] },
          { id: '789', name: 'orgx/repoa', webUrl: '', workflows: [] },
        ];
        repos.forEach((r) => repoRepo.addRepo(r));
        const response = await agent.get('/basic').set('Authorization', `Bearer ${token}`).send();

        const body = response.body as BasicBuildInfoResponse;
        expect(body.spaces).toHaveLength(repos.length);
      });
    });
  });
});
