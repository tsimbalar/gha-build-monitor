import { EnvVars } from '../../EnvVars';
import { Secrets } from './secrets-types';

let realSecrets: Partial<Secrets> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  realSecrets = require('./secrets').SECRETS;
  // eslint-disable-next-line no-empty
} catch {
  realSecrets = EnvVars.getOptionalJson<Partial<Secrets>>('TEST_CREDENTIALS', {});
}

const DEFAULT_SECRETS: Secrets = {
  PAT_NO_SCOPE: '<PAT_NO_SCOPE NOT SET>',
  PAT_SCOPE_REPO: '<PAT_SCOPE_REPO NOT SET>',
};

export const testCredentials: Secrets = { ...DEFAULT_SECRETS, ...realSecrets };
