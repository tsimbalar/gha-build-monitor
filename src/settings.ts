import { EnvVars } from './infra/EnvVars';
import { Settings } from './settings-types';

export function loadSettingsFromEnvVars(): Settings {
  return {
    catlight: {},
    http: {
      port: EnvVars.getOptionalInteger('HTTP_PORT', 9901),
    },
  };
}
