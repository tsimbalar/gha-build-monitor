/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApiTestTools, TEST_SETTINGS, TestAgent } from '../__testTools__/ApiTestTools';
import { BuildDefinition, Space } from '../../catlight-protocol/basic';
import { RepoName, Workflow } from '../../domain/IRepoRepository';
import { BasicBuildInfoResponse } from '../api-types';
import { Fixtures } from '../__testTools__/Fixtures';
import { InMemoryRepoRepository } from '../../infra/memory/InMemoryRepoRepository';
import { InMemoryUserRepository } from '../../infra/memory/InMemoryUserRepository';
import { InMemoryWorkflowRunRepository } from '../../infra/memory/InMemoryWorkflowRunRepository';
import { WorkflowRun } from '../../domain/IWorkflowRunRepository';

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
      const user = Fixtures.userWithScopes([]);
      const userRepo = new InMemoryUserRepository();
      userRepo.addUser(token, user);

      const agent = ApiTestTools.createTestAgent({ userRepo });

      const response = await agent.get('/basic').set('Authorization', `Bearer ${token}`).send();
      expect(response.status).toBe(403);
      expect(response.type).toBe('application/json');
    });

    describe('with token of existing user', () => {
      const token = 'THIS_IS_THE_TOKEN';
      const user = Fixtures.userWithScopes(['repo']);
      const installationId = 'THE_INSTALLATION_ID';
      let agent: TestAgent;
      let repoRepo: InMemoryRepoRepository;
      let workflowRunRepo: InMemoryWorkflowRunRepository;

      beforeEach(() => {
        const userRepo = new InMemoryUserRepository();
        userRepo.addUser(token, user);

        repoRepo = new InMemoryRepoRepository();
        workflowRunRepo = new InMemoryWorkflowRunRepository();

        agent = ApiTestTools.createTestAgent(
          { userRepo, repoRepo, workflowRunRepo },
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
        expect(body.currentUser).toEqual({ id: user.id, name: user.name });
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
            branches: [],
          },
          {
            id: workflow2.id,
            name: workflow2.name,
            folder: repoName.fullName,
            webUrl: workflow2.webUrl,
            branches: [],
          },
        ]);
      });

      test('should return build branches', async () => {
        const repoName = new RepoName('orgx', 'repoz');
        const workflowId = 'worflow-id';
        repoRepo.addRepo({
          id: '123',
          name: repoName,
          webUrl: '',
          workflows: [
            {
              id: workflowId,
              name: 'workflow-name',
              webUrl: 'http://www.perdu.com',
            },
          ],
        });

        const branch1 = 'master';
        const branch1Runs: WorkflowRun[] = [
          {
            id: 'master1',
            startTime: new Date(),
            status: 'Queued',
            webUrl: 'http://....',
            event: 'push',
          },
        ];

        const branch2 = 'develop';
        const branch2Runs: WorkflowRun[] = [
          {
            id: 'develop1',
            startTime: new Date(),
            status: 'Queued',
            webUrl: 'http://....',
            event: 'push',
          },
        ];

        workflowRunRepo.addRuns(repoName, workflowId, branch1, branch1Runs);
        workflowRunRepo.addRuns(repoName, workflowId, branch2, branch2Runs);
        const response = await agent.get('/basic').set('Authorization', `Bearer ${token}`).send();

        const body = response.body as BasicBuildInfoResponse;
        expect(body.spaces).toHaveLength(1);
        const buildDefinitions = body.spaces[0].buildDefinitions;
        expect(buildDefinitions).toHaveLength(1);
        const buildBranches = buildDefinitions[0].branches;
        expect(buildBranches).toHaveLength(2);

        const buildBranch1 = buildBranches.find((b) => b.id === branch1)!;
        expect(buildBranch1).toBeDefined();
        expect(buildBranch1.builds).toHaveLength(1);
        expect(buildBranch1.builds[0].id).toBe('master1');

        const buildBranch2 = buildBranches.find((b) => b.id === branch2)!;
        expect(buildBranch2).toBeDefined();
        expect(buildBranch2.builds).toHaveLength(1);
        expect(buildBranch2.builds[0].id).toBe('develop1');
      });
    });
  });
});
