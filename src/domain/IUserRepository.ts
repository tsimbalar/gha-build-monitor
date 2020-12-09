export interface User {
  readonly login: string;
  readonly id: string;
}

export interface UserWithScopes extends User {
  readonly scopes: string[];
}

export interface IUserRepository {
  getUserFromToken(token: string): Promise<UserWithScopes>;
}
