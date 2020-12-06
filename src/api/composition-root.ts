import { ConstructorFunction, IControllerFactory } from './infra/IControllerFactory';
import { BasicBuildInfoController } from './controllers/BasicBuildInfoController';
import { Controller } from '@tsoa/runtime';
import { ExampleController } from './controllers/ExampleController';
import { Settings } from '../settings-types';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-var-requires
const versionFromPackageJson: string = require('../../package.json').version;
const SERVER_PREFIX = 'gha-build-monitor';
const SERVER_NAME = 'gha-build-monitor';

export class CompositionRoot implements IControllerFactory {
  constructor(private readonly settings: Settings) {}

  public get<T>(controllerConstructor: ConstructorFunction<T>): Controller {
    switch (controllerConstructor.name) {
      case ExampleController.name:
        return new ExampleController();
      case BasicBuildInfoController.name:
        return new BasicBuildInfoController(
          `${SERVER_PREFIX}/${this.settings.catlight.installationId}`,
          SERVER_NAME,
          versionFromPackageJson
        );
      default:
        // eslint-disable-next-line no-console
        console.error('Cannot create an instance of ', controllerConstructor);
        throw new Error(`How do I create an instance of ${controllerConstructor} ?? `);
    }
  }
}
