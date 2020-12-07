import { IUserRepository, User } from '../../domain/IUserRepository';
import { OctokitFactory } from './OctokitFactory';

export class UserRepository implements IUserRepository {
  public constructor(private readonly githubFactory: OctokitFactory) {}

  public async getUserFromToken(token: string): Promise<User> {
    const gitHubClient = this.githubFactory(token);

    const response = await gitHubClient.users.getAuthenticated({});

    return {
      id: response.data.id.toString(),
      login: response.data.login,
    };
  }
}
