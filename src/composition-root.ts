import { ConstructorFunction, IControllerFactory } from './api/ioc/IControllerFactory';
import { MetaInfo, meta as metaFromPackageJson } from './meta';
import { BasicBuildInfoController } from './api/controllers/BasicBuildInfoController';
import { Controller } from '@tsoa/runtime';
import { DiagnosticsController } from './api/controllers/DiagnosticsController';
import { ExampleController } from './api/controllers/ExampleController';
import { Settings } from './settings-types';

const SERVER_PREFIX = 'gha-build-monitor';
const SERVER_NAME = 'gha-build-monitor';

export class CompositionRoot implements IControllerFactory {
  private readonly meta: MetaInfo;

  public constructor(private readonly settings: Settings, meta?: MetaInfo) {
    this.meta = meta ?? metaFromPackageJson;
  }

  public get<T>(controllerConstructor: ConstructorFunction<T>): Controller {
    switch (controllerConstructor.name) {
      case ExampleController.name:
        return new ExampleController();
      case BasicBuildInfoController.name:
        return new BasicBuildInfoController(
          `${SERVER_PREFIX}/${this.settings.catlight.installationId}`,
          SERVER_NAME,
          this.meta.version
        );
      case DiagnosticsController.name:
        return new DiagnosticsController(this.meta);
      default:
        // eslint-disable-next-line no-console
        console.error('Cannot create an instance of ', controllerConstructor);
        throw new Error(`How do I create an instance of ${controllerConstructor} ?? `);
    }
  }
}