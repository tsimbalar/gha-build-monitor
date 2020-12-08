import { IUserRepository, User } from '../../domain/IUserRepository';
import { OctokitFactory } from './OctokitFactory';

export class UserRepository implements IUserRepository {
  public constructor(private readonly octokitFactory: OctokitFactory) {}

  public async getUserFromToken(token: string): Promise<User> {
    const octokit = this.octokitFactory(token);

    const response = await octokit.users.getAuthenticated({});

    return {
      id: response.data.id.toString(),
      login: response.data.login,
    };
  }
}
