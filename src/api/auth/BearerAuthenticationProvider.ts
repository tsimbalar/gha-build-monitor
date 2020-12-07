/* eslint-disable no-console */
import { IAuthenticatedUser } from './IAuthentication';
import { IAuthenticationProvider } from './IAuthenticationProvider';
import { IUserRepository } from '../../domain/IUserRepository';
import { Request } from 'express';

// Note: express http converts all headers
// to lower case.
export const AUTH_HEADER = 'authorization';
const BEARER_AUTH_SCHEME = 'bearer';
const AUTH_SCHEME_REGEX = /(?<scheme>\S+) +(?<value>\S+)/u;

export class BearerAuthenticationProvider implements IAuthenticationProvider {
  public readonly securityScheme = 'bearerAuth';

  public constructor(private readonly users: IUserRepository) {}

  public async getAuthenticatedUser(request: Request): Promise<IAuthenticatedUser | null> {
    const token = this.getBearerTokenFromRequest(request);
    if (!token) {
      return null;
    }

    return this.getUserInfoFromGitHub(token);
  }

  private getBearerTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers[AUTH_HEADER];
    if (!authHeader) {
      console.debug(`Missing ${AUTH_HEADER} header in request`);
      return null;
    }

    const regexMatch = AUTH_SCHEME_REGEX.exec(authHeader);
    if (!regexMatch) {
      console.debug(`Header ${AUTH_HEADER} is not in a valid format [scheme value]`);
      return null;
    }
    const [, authScheme, rawToken] = regexMatch;
    if (authScheme.toLowerCase() !== BEARER_AUTH_SCHEME.toLowerCase()) {
      console.debug(
        `Header ${AUTH_HEADER} doesn't use ${BEARER_AUTH_SCHEME} scheme. Found : "${authScheme}"`
      );
      return null;
    }
    return rawToken;
  }

  private async getUserInfoFromGitHub(token: string): Promise<IAuthenticatedUser> {
    const user = await this.users.getUserFromToken(token);

    return {
      id: user.id,
      name: user.login,
      token,
    };
  }
}
