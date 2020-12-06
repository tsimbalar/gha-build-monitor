import { IAuthenticatedUser } from './auth/IAuthentication';

declare module 'express' {
  export interface Request {
    user?: IAuthenticatedUser;
  }
}
