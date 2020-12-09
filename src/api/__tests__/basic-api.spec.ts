import { ApiTestTools, TEST_SETTINGS, TestAgent } from '../__testTools__/ApiTestTools';
import { BuildDefinition, Space } from '../catlight-protocol';
import { RepoName, Workflow } from '../../domain/IRepoRepository';
import { BasicBuildInfoResponse } from '../api-types';
import { InMemoryRepoRepository } from '../../infra/memory/InMemoryRepoRepository';
import { InMemoryUserRepository } from '../../infra/memory/InMemoryUserRepository';
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
        const repo1 = { id: '789', name: new RepoName('orgx', 'repoa'), webUrl: '', workflows: [] };
        const repo2 = { id: '123', name: new RepoName('orgx', 'repoz'), webUrl: '', workflows: [] };
        repoRepo.addRepo(repo1);
        repoRepo.addRepo(repo2);
        const response = await agent.get('/basic').set('Authorization', `Bearer ${token}`).send();

        const body = response.body as BasicBuildInfoResponse;
        expect(body.spaces).toEqual<Space[]>([
          {
            id: repo1.id,
            name: repo1.name.fullName,
            webUrl: repo1.webUrl,
            buildDefinitions: expect.anything(),
          },
          {
            id: repo2.id,
            name: repo2.name.fullName,
            webUrl: repo2.webUrl,
            buildDefinitions: expect.anything(),
          },
        ]);
      });

      test('should return build definitions', async () => {
        const workflow1: Workflow = {
          id: 'worflow-id',
          name: 'workflow-name',
          webUrl: 'http://www.perdu.com',
        };
        const workflow2: Workflow = {
          id: 'worflow-id2',
          name: 'workflow-name2',
          webUrl: 'http://www.perdu2.com',
        };
        const repoName = new RepoName('orgx', 'repoz');
        repoRepo.addRepo({
          id: '123',
          name: repoName,
          webUrl: '',
          workflows: [workflow1, workflow2],
        });
        const response = await agent.get('/basic').set('Authorization', `Bearer ${token}`).send();

        const body = response.body as BasicBuildInfoResponse;
        expect(body.spaces).toHaveLength(1);
        const buildDefinitions = body.spaces[0].buildDefinitions;
        expect(buildDefinitions).toEqual<BuildDefinition[]>([
          {
            id: workflow1.id,
            name: workflow1.name,
            folder: repoName.fullName,
            webUrl: workflow1.webUrl,
            branches: [
              {
                id: '~all',
                builds: expect.anything(),
              },
            ],
          },
          {
            id: workflow2.id,
            name: workflow2.name,
            folder: repoName.fullName,
            webUrl: workflow2.webUrl,
            branches: [
              {
                id: '~all',
                builds: expect.anything(),
              },
            ],
          },
        ]);
      });
    });
  });
});
