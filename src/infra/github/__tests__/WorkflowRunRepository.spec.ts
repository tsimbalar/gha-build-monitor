import {
  CommitAuthor,
  CommitAuthorRepository,
  ICommitAuthorRepository,
} from '../CommitAuthorRepository';
import { THIS_REPO_MAIN_WORKFLOW, THIS_REPO_NAME } from '../__testTools__/TestConstants';
import { WorkflowRun, WorkflowRunAuthor } from '../../../domain/IWorkflowRunRepository';
import { RepoName } from '../../../domain/IRepoRepository';
import { WorkflowRunRepository } from '../WorkflowRunRepository';
import { getOctokitFactory } from '../OctokitFactory';
import { testCredentials } from '../__testTools__/TestCredentials';

class EmptyCommitAuthorRepo implements ICommitAuthorRepository {
  public async getAuthorForCommit(
    token: string,
    repoName: RepoName,
    commitId: string
  ): Promise<CommitAuthor | null> {
    return null;
  }
}
describe('WorkflowRunRepository', () => {
  const octokitFactory = getOctokitFactory({
    version: 'v0-tests',
    buildInfo: {},
  });
  const emptyCommitAutorRepo = new EmptyCommitAuthorRepo();
  describe('getLatestRunsForWorkflow', () => {
    test('should retrieve runs of public repo #needs-secrets', async () => {
      const sut = new WorkflowRunRepository(octokitFactory, emptyCommitAutorRepo);

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
        event: expect.stringContaining(''),
      });
    });

    test('should retrieve authors of commits on public repo #needs-secrets', async () => {
      const sut = new WorkflowRunRepository(
        octokitFactory,
        new CommitAuthorRepository(octokitFactory)
      );

      const actual = await sut.getLatestRunsForWorkflow(
        testCredentials.PAT_NO_SCOPE,
        THIS_REPO_NAME,
        THIS_REPO_MAIN_WORKFLOW.id,
        {
          maxAgeInDays: 10,
          maxRunsPerBranch: 1,
        }
      );

      expect([...actual.entries()]).not.toHaveLength(0);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const runsOfBranchMain = actual.get('main')!;
      expect(runsOfBranchMain).toBeDefined();
      expect(runsOfBranchMain).not.toHaveLength(0);

      const actualRun = runsOfBranchMain[0];
      expect(actualRun.mainAuthor).toEqual<WorkflowRunAuthor>({
        login: expect.stringContaining(''),
        name: expect.stringContaining(''),
      });
    }, 20000);

    test('should name branches according to triggering event #needs-secrets', async () => {
      const sut = new WorkflowRunRepository(octokitFactory, emptyCommitAutorRepo);

      const actual = await sut.getLatestRunsForWorkflow(
        testCredentials.PAT_NO_SCOPE,
        THIS_REPO_NAME,
        THIS_REPO_MAIN_WORKFLOW.id,
        {
          maxAgeInDays: 10,
          maxRunsPerBranch: 1,
        }
      );

      expect([...actual.entries()]).not.toHaveLength(0);
      const branchesForPRs = [...actual.entries()]
        .filter(([branchName, runs]) => runs.find((r) => r.event === 'pull_request'))
        .map((x) => x[0]);

      for (const prBranch of branchesForPRs) {
        expect(prBranch).toMatch('PR#');
      }

      const branchesForPushes = [...actual.entries()]
        .filter(([branchName, runs]) => runs.find((r) => r.event === 'push'))
        .map((x) => x[0]);

      for (const prBranch of branchesForPushes) {
        expect(prBranch).not.toMatch('PR#');
      }
    });

    test('should sort builds from older to newer #needs-secrets', async () => {
      const sut = new WorkflowRunRepository(octokitFactory, emptyCommitAutorRepo);

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

    test('should apply maxAgeInDays #needs-secrets', async () => {
      const maxAgeInDays = 3;
      const sut = new WorkflowRunRepository(octokitFactory, emptyCommitAutorRepo);

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

    test('should apply maxRunsPerBranch in repo with lots of activity #needs-secrets', async () => {
      const maxRunsPerBranch = 2;
      const sut = new WorkflowRunRepository(octokitFactory, emptyCommitAutorRepo);

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
    }, 60000 /* timeout - can take a while */);
  });
});
