import { IAuthenticatedUser } from '../api/auth/IAuthentication';

export interface User {
  readonly login: string;
  readonly id: string;
}

export interface IUserRepository {
  getUserFromToken(token: string): Promise<User>;
}
