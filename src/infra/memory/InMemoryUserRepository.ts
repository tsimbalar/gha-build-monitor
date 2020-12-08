import { IUserRepository, User } from '../../domain/IUserRepository';

export type StoredUser = User & { readonly token: string };

export class InMemoryUserRepository implements IUserRepository {
  private readonly users: StoredUser[] = [];

  public async getUserFromToken(token: string): Promise<User> {
    const storedUser = this.users.find((u) => u.token === token);
    if (!storedUser) {
      throw new Error(`Could not find user with token ${token}`);
    }

    return {
      id: storedUser.id,
      login: storedUser.login,
      scopes: storedUser.scopes,
    };
  }

  public addUser(token: string, user: User): void {
    this.users.push({ token, ...user });
  }
}
