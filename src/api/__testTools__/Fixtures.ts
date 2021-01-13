import { User, UserWithScopes } from '../../domain/IUserRepository';

export class Fixtures {
  public static userWithScopes(scopes: string[], options: Partial<User> = {}): UserWithScopes {
    return {
      login: options.login ?? `USER_LOGIN_${new Date().getTime()}`,
      name: options.name === undefined ? `User Name ${new Date().getTime()}` : options.name,
      scopes,
    };
  }
}
