import {
  THIS_REPO,
  THIS_REPO_MAIN_WORKFLOW,
  THIS_REPO_NAME,
  THIS_REPO_OWNER,
} from '../__testTools__/TestConstants';
import { Repo } from '../../../domain/IRepoRepository';
import { RepoRepository } from '../RepoRepository';
import { octokitFactory } from '../OctokitFactory';
import { testCredentials } from '../__testTools__/TestCredentials';

describe('RepoRepository', () => {
  describe('listForToken', () => {
    test('should return only public repos when using "no scope" token', async () => {
      const sut = new RepoRepository(octokitFactory);

      const actual = await sut.listForToken(testCredentials.PAT_NO_SCOPE);

      expect(actual).not.toHaveLength(0);

      // check one that we know will exist
      const thisRepo = actual.find((s) => s.name.equals(THIS_REPO_NAME));
      expect(thisRepo).toBeDefined();
      expect(thisRepo).toEqual<Repo>({
        ...THIS_REPO,
        workflows: [THIS_REPO_MAIN_WORKFLOW],
      });

      const reposWithoutTsimbalar = actual.filter((s) => !s.name.belongsTo(THIS_REPO_OWNER));

      expect(reposWithoutTsimbalar).toHaveLength(0);
    });

    test('should return all repos across multiple organizations when using token with scope "repo"', async () => {
      const sut = new RepoRepository(octokitFactory);

      const actual = await sut.listForToken(testCredentials.PAT_SCOPE_REPO);

      expect(actual).not.toHaveLength(0);
      expect(actual.length).toBeGreaterThan(31); // just to be sure we didn't stop at default pagination - see https://octokit.github.io/rest.js/v18#pagination

      // check one that we know will exist
      const spaceForThisRepo = actual.find((s) => s.name.equals(THIS_REPO_NAME));
      expect(spaceForThisRepo).toBeDefined();
      expect(spaceForThisRepo).toEqual<Repo>({
        ...THIS_REPO,
        workflows: [THIS_REPO_MAIN_WORKFLOW],
      });

      const spacesWithoutTsimbalar = actual.filter((s) => !s.name.belongsTo(THIS_REPO_OWNER));
      expect(spacesWithoutTsimbalar).not.toHaveLength(0);

      const spacesOwnedBySerilog = actual.filter((s) => s.name.owner === 'serilog');
      expect(spacesOwnedBySerilog).not.toHaveLength(0);

      const spacesWithWorkflows = spacesWithoutTsimbalar.filter((s) => s.workflows.length > 0);
      expect(spacesWithWorkflows).not.toHaveLength(0);
    }, 20000 /* this may take a while */);
  });
});
