export interface User {
  readonly login: string;
  readonly id: string;
  readonly scopes: string[];
}

export interface IUserRepository {
  getUserFromToken(token: string): Promise<User>;
}
