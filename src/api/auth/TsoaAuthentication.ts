/* eslint-disable no-console */
import * as Errors from '../http-errors';
import { IAuthenticatedUser, IAuthentication } from './IAuthentication';
import { IAuthenticationProvider } from './IAuthenticationProvider';
import { Request } from 'express';

export const BEARER_AUTH_SCHEME = 'bearerAuth';

export class TsoaAuthentication implements IAuthentication {
  public constructor(private readonly providers: ReadonlyArray<IAuthenticationProvider>) {}

  public async enforceAccessControlRules(
    request: Request,
    securitySchemeName: string,
    scopes?: string[]
  ): Promise<IAuthenticatedUser | null> {
    console.debug(
      `Authenticating ${request.method} ${request.url} request for Security "${securitySchemeName}" and scopes [${scopes}]`
    );
    for (const supportedProvider of this.providers) {
      if (supportedProvider.securityScheme === securitySchemeName) {
        // eslint-disable-next-line no-await-in-loop
        const user = await this.doAuthentication(supportedProvider, request, scopes);
        if (user !== null) {
          return user;
        }
      }
    }

    throw new Error(`Security scheme ${securitySchemeName} is not supported right now`);
  }

  private async doAuthentication(
    provider: IAuthenticationProvider,
    request: Request,
    scopes?: string[]
  ): Promise<IAuthenticatedUser | null> {
    let authenticatedUser: IAuthenticatedUser | null = null;
    try {
      authenticatedUser = await provider.getAuthenticatedUser(request);
    } catch (err) {
      console.error(
        err,
        'An error occurred while authenticating request - returning Unauthorized - 401'
      );
      console.debug(`Request headers are`, { requestHeaders: request.headers });
      throw new Errors.UnauthorizedError();
    }

    if (authenticatedUser === null) {
      console.debug('Request could not be authenticated');
      throw new Errors.UnauthorizedError();
    }

    this.ensureUserIsAuthorized(authenticatedUser, scopes);

    console.debug('Request was authenticated');
    return authenticatedUser; // will be assigned to request.user
  }

  private ensureUserIsAuthorized(
    authenticatedUser: IAuthenticatedUser,
    requiredScopes?: string[]
  ): void {
    if (requiredScopes && requiredScopes.length > 0) {
      const foundMatchingScopes: string[] = [];
      for (const requiredScope of requiredScopes) {
        if (authenticatedUser.tokenScopes.includes(requiredScope)) {
          foundMatchingScopes.push(requiredScope);
        }
      }

      if (foundMatchingScopes.length !== requiredScopes.length) {
        console.warn(
          `Request could not be authorized for scopes [${requiredScopes}]. User has scopes : [${authenticatedUser.tokenScopes}]. Matched [${foundMatchingScopes}]`
        );
        throw new Errors.ForbiddenError();
      }
      console.debug(
        `Request authorized for roles [${requiredScopes}]. User has scopes : [${authenticatedUser.tokenScopes}]. Matched [${foundMatchingScopes}]`
      );
    }
  }
}
