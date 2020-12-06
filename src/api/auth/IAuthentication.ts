import { Request } from 'express';

export interface IAuthenticatedUser {
  readonly id: string;
  readonly name: string;
  readonly token: string;
}

export interface IAuthentication {
  enforceAccessControlRules(
    request: Request,
    securityName: string
  ): Promise<IAuthenticatedUser | null>;
}
