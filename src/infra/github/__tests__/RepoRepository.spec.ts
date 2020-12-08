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
      const spaceForThisRepo = actual.find((s) => s.name === 'tsimbalar/gha-build-monitor');
      expect(spaceForThisRepo).toBeDefined();
      expect(spaceForThisRepo).toEqual<Repo>({
        id: '318302976',
        name: 'tsimbalar/gha-build-monitor',
        webUrl: 'https://github.com/tsimbalar/gha-build-monitor',
        workflows: [
          {
            id: '4055612',
            name: 'Main',
            webUrl:
              'https://api.github.com/repos/tsimbalar/gha-build-monitor/actions/workflows/4055612',
          },
        ],
      });

      const regex = /^tsimbalar\/.*$/u;
      const spacesWithouTsimbalar = actual.filter((s) => !regex.exec(s.name));

      expect(spacesWithouTsimbalar).toHaveLength(0);
    });

    test('should return all repos across multiple organizations when using token with scope "repo"', async () => {
      const sut = new RepoRepository(octokitFactory);

      const actual = await sut.listForToken(testCredentials.PAT_SCOPE_REPO);

      expect(actual).not.toHaveLength(0);
      expect(actual.length).toBeGreaterThan(31); // just to be sure we didn't stop at default pagination - see https://octokit.github.io/rest.js/v18#pagination

      // check one that we know will exist
      const spaceForThisRepo = actual.find((s) => s.name === 'tsimbalar/gha-build-monitor');
      expect(spaceForThisRepo).toBeDefined();
      expect(spaceForThisRepo).toEqual<Repo>({
        id: '318302976',
        name: 'tsimbalar/gha-build-monitor',
        webUrl: 'https://github.com/tsimbalar/gha-build-monitor',
        workflows: [
          {
            id: '4055612',
            name: 'Main',
            webUrl:
              'https://api.github.com/repos/tsimbalar/gha-build-monitor/actions/workflows/4055612',
          },
        ],
      });

      const ownedByTsimbalarRegexp = /^tsimbalar\/.*$/u;
      const spacesWithoutTsimbalar = actual.filter((s) => !ownedByTsimbalarRegexp.exec(s.name));
      expect(spacesWithoutTsimbalar).not.toHaveLength(0);

      const ownedBySerilogRegexp = /^serilog\/.*$/u;
      const spacesOwnedBySerilog = actual.filter((s) => ownedBySerilogRegexp.exec(s.name));
      expect(spacesOwnedBySerilog).not.toHaveLength(0);

      const spacesWithWorkflows = spacesWithoutTsimbalar.filter((s) => s.workflows.length > 0);
      expect(spacesWithWorkflows).not.toHaveLength(0);
    }, 20000 /* this may take a while */);
  });
});
