import { IUserRepository, User } from '../../domain/IUserRepository';
import { OctokitFactory } from './OctokitFactory';

export class UserRepository implements IUserRepository {
  public constructor(private readonly octokitFactory: OctokitFactory) {}

  public async getUserFromToken(token: string): Promise<User> {
    const octokit = this.octokitFactory(token);

    const response = await octokit.users.getAuthenticated({});

    const userScopes = (response.headers['x-oauth-scopes'] ?? '')
      .split(',')
      .filter((x) => x !== '');

    return {
      id: response.data.id.toString(),
      login: response.data.login,
      scopes: userScopes,
    };
  }
}
