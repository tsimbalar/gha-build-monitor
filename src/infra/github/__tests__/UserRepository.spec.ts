import { User } from '../../../domain/IUserRepository';
import { UserRepository } from '../UserRepository';
import { octokitFactory } from '../OctokitFactory';
import { testCredentials } from '../__testTools__/TestCredentials';

describe('UserRepository', () => {
  describe('getUserFromToken', () => {
    test('should return user info with valid token', async () => {
      const sut = new UserRepository(octokitFactory);

      const actual = await sut.getUserFromToken(testCredentials.PAT_NO_SCOPE);

      expect(actual).toEqual<User>({
        id: '160544',
        login: 'tsimbalar',
        scopes: [],
      });
    });

    test('should return scopes of user with "repo" scope', async () => {
      const sut = new UserRepository(octokitFactory);

      const actual = await sut.getUserFromToken(testCredentials.PAT_SCOPE_REPO);

      expect(actual).toEqual<User>({
        id: '160544',
        login: 'tsimbalar',
        scopes: ['repo'],
      });
    });

    test('should throw when token does not match a user', async () => {
      const sut = new UserRepository(octokitFactory);

      let caughtError!: Error;
      try {
        await sut.getUserFromToken('some_random_token');
      } catch (e) {
        caughtError = e;
      }

      expect(caughtError).toBeDefined();
    });
  });
});
