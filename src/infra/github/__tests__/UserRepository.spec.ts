import { User } from '../../../domain/IUserRepository';
import { UserRepository } from '../UserRepository';
import { octokitFactory } from '../OctokitFactory';

// Personal Access Token with no scope
const MINIMAL_PRIVILEGE_GITHUB_TOKEN = 'b98fcc278378051761414236ad1c5a2a741cd313';

describe('UserRepository', () => {
  describe('getUserFromToken', () => {
    test('should return user info with valid token', async () => {
      const sut = new UserRepository(octokitFactory);

      const actual = await sut.getUserFromToken(MINIMAL_PRIVILEGE_GITHUB_TOKEN);

      expect(actual).toEqual<User>({
        id: '160544',
        login: 'tsimbalar',
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
