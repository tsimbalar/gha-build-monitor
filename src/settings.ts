import { EnvVars } from './infra/EnvVars';
import { Settings } from './settings-types';

export function loadSettingsFromEnvVars(): Settings {
  return {
    catlight: {
      installationId: EnvVars.getString('INSTALLATION_ID'),
    },
    http: {
      port: EnvVars.getOptionalInteger('HTTP_PORT', 9901),
    },
  };
}
