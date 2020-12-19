import { IUserRepository, UserWithScopes } from '../../domain/IUserRepository';

export type StoredUser = UserWithScopes & { readonly token: string };

export class InMemoryUserRepository implements IUserRepository {
  private readonly users: StoredUser[] = [];

  public async getUserFromToken(token: string): Promise<UserWithScopes> {
    const storedUser = this.users.find((u) => u.token === token);
    if (!storedUser) {
      throw new Error(`Could not find user with token ${token}`);
    }

    return {
      id: storedUser.id,
      name: storedUser.name,
      login: storedUser.login,
      scopes: storedUser.scopes,
    };
  }

  public addUser(token: string, user: UserWithScopes): void {
    this.users.push({ token, ...user });
  }
}
