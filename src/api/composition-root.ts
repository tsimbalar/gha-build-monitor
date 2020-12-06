import { ConstructorFunction, IControllerFactory } from './infra/IControllerFactory';
import { BasicBuildInfoController } from './controllers/BasicBuildInfoController';
import { Controller } from '@tsoa/runtime';
import { ExampleController } from './controllers/ExampleController';
import { Settings } from '../settings-types';

const SERVER_PREFIX = 'gha-build-monitor';

export class CompositionRoot implements IControllerFactory {
  constructor(private readonly settings: Settings) {}

  public get<T>(controllerConstructor: ConstructorFunction<T>): Controller {
    switch (controllerConstructor.name) {
      case ExampleController.name:
        return new ExampleController();
      case BasicBuildInfoController.name:
        return new BasicBuildInfoController(
          `${SERVER_PREFIX}/${this.settings.catlight.installationId}`
        );
      default:
        // eslint-disable-next-line no-console
        console.error('Cannot create an instance of ', controllerConstructor);
        throw new Error(`How do I create an instance of ${controllerConstructor} ?? `);
    }
  }
}
