import { IAuthenticatedUser } from './IAuthentication';
import { Request } from 'express';

export interface IAuthenticationProvider {
  getAuthenticatedUser(request: Request): Promise<IAuthenticatedUser | null>;

  readonly securityScheme: string;
}
