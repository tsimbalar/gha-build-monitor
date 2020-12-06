import * as express from 'express';
import { IAuthentication } from './auth/IAuthentication';

// needed for tsoa to know how to handle @Security annotations

type TsoaAuthFunction = (
  request: express.Request,
  securityName: string,
  scopes?: string[]
) => Promise<unknown>;

export function RegisterAuth(auth: IAuthentication): void {
  expressAuthentication = auth.enforceAccessControlRules.bind(auth);
}

// tsoa wants an export named `expressAuthentication`
export let expressAuthentication: TsoaAuthFunction = () => {
  throw new Error('tsoa auth not registered yet !');
};
