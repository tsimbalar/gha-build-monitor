import { Request } from 'express';

export interface IAuthenticatedUser {
  readonly login: string;
  readonly name: string | null;
  readonly token: string;
  readonly tokenScopes: string[];
}

export interface IAuthentication {
  enforceAccessControlRules(
    request: Request,
    securityName: string
  ): Promise<IAuthenticatedUser | null>;
}
