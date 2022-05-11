import { THIS_REPO_OWNER } from '../__testTools__/TestConstants';
import { UserRepository } from '../UserRepository';
import { UserWithScopes } from '../../../domain/IUserRepository';
import { getOctokitFactory } from '../OctokitFactory';
import { testCredentials } from '../__testTools__/TestCredentials';

describe('UserRepository', () => {
  const octokitFactory = getOctokitFactory({
    version: 'v0-tests',
    buildInfo: {},
  });
  describe('getUserFromToken', () => {
    test('should return user info with valid token #needs-secrets', async () => {
      const sut = new UserRepository(octokitFactory);

      const actual = await sut.getUserFromToken(testCredentials.PAT_NO_SCOPE);

      expect(actual).toEqual<UserWithScopes>({
        ...THIS_REPO_OWNER,
        scopes: [],
      });
    });

    test('should return scopes of user with "repo" scope #needs-secrets', async () => {
      const sut = new UserRepository(octokitFactory);

      const actual = await sut.getUserFromToken(testCredentials.PAT_SCOPE_REPO);

      expect(actual).toEqual<UserWithScopes>({
        ...THIS_REPO_OWNER,
        scopes: ['repo'],
      });
    });

    test('should throw when token does not match a user', async () => {
      const sut = new UserRepository(octokitFactory);

      let caughtError!: unknown;
      try {
        await sut.getUserFromToken('some_random_token');
      } catch (e) {
        caughtError = e;
      }

      expect(caughtError).toBeDefined();
    });
  });
});
