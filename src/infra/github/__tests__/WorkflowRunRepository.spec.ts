import { THIS_REPO_MAIN_WORKFLOW, THIS_REPO_NAME } from '../__testTools__/TestConstants';
import { RepoName } from '../../../domain/IRepoRepository';
import { WorkflowRun } from '../../../domain/IWorkflowRunRepository';
import { WorkflowRunRepository } from '../WorkflowRunRepository';
import { getOctokitFactory } from '../OctokitFactory';
import { testCredentials } from '../__testTools__/TestCredentials';

describe('WorkflowRunRepository', () => {
  const octokitFactory = getOctokitFactory({
    version: 'v0-tests',
    buildInfo: {},
  });
  describe('getLatestRunsForWorkflow', () => {
    test('should retrieve runs of public repo', async () => {
      const sut = new WorkflowRunRepository(octokitFactory);

      const actual = await sut.getLatestRunsForWorkflow(
        testCredentials.PAT_NO_SCOPE,
        THIS_REPO_NAME,
        THIS_REPO_MAIN_WORKFLOW.id,
        {
          maxAgeInDays: 30,
          maxRunsPerBranch: 5,
        }
      );

      expect([...actual.entries()]).not.toHaveLength(0);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const runsOfBranchMain = actual.get('main')!;
      expect(runsOfBranchMain).toBeDefined();
      expect(runsOfBranchMain).not.toHaveLength(0);

      const actualRun = runsOfBranchMain[0];
      expect(actualRun).toEqual<WorkflowRun>({
        id: expect.stringContaining(''),
        name: expect.stringContaining(''),
        startTime: expect.any(Date),
        status: expect.stringContaining(''),
        webUrl: expect.stringContaining('github.com'),
        finishTime: expect.anything(),
      });
    });

    test('should sort builds from older to newer', async () => {
      const sut = new WorkflowRunRepository(octokitFactory);

      const actual = await sut.getLatestRunsForWorkflow(
        testCredentials.PAT_NO_SCOPE,
        THIS_REPO_NAME,
        THIS_REPO_MAIN_WORKFLOW.id,
        {
          maxAgeInDays: 30,
          maxRunsPerBranch: 3,
        }
      );

      expect([...actual.entries()]).not.toHaveLength(0);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const runsOfBranchMain = actual.get('main')!;
      const oldestRun = runsOfBranchMain[0];
      const secondOldestRun = runsOfBranchMain[1];
      // oldest first
      expect(oldestRun.startTime.getTime()).toBeLessThan(secondOldestRun.startTime.getTime());
    });

    test('should apply maxAgeInDays', async () => {
      const maxAgeInDays = 3;
      const sut = new WorkflowRunRepository(octokitFactory);

      const actual = await sut.getLatestRunsForWorkflow(
        testCredentials.PAT_NO_SCOPE,
        THIS_REPO_NAME,
        THIS_REPO_MAIN_WORKFLOW.id,
        { maxAgeInDays, maxRunsPerBranch: 1 }
      );

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const runsOfBranchMain = actual.get('main')!;
      expect(runsOfBranchMain).toBeDefined();
      expect(runsOfBranchMain).not.toHaveLength(0);
      const oldestRun = runsOfBranchMain[0];
      const nDaysAgo = new Date();
      nDaysAgo.setDate(nDaysAgo.getDate() - maxAgeInDays);

      expect(oldestRun.startTime.getTime()).toBeGreaterThan(nDaysAgo.getTime());
    });

    test('should apply maxRunsPerBranch in repo with lots of activity', async () => {
      const maxRunsPerBranch = 2;
      const sut = new WorkflowRunRepository(octokitFactory);

      const actual = await sut.getLatestRunsForWorkflow(
        testCredentials.PAT_NO_SCOPE,
        new RepoName('github', 'docs'),
        '3233768', // workflow with name "Lint JS"
        { maxAgeInDays: 2, maxRunsPerBranch }
      );

      const branchRunsWithMoreThanNBuilds = [...actual.entries()].filter(
        ([branch, runs]) => runs.length > maxRunsPerBranch
      );
      expect(branchRunsWithMoreThanNBuilds).toHaveLength(0);
    }, 15000 /* timeout - can take a while */);
  });
});
