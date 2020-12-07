import { ConstructorFunction, IControllerFactory } from './api/ioc/IControllerFactory';
import { MetaInfo, meta as metaFromPackageJson } from './meta';
import { BasicBuildInfoController } from './api/controllers/BasicBuildInfoController';
import { BearerAuthenticationProvider } from './api/auth/BearerAuthenticationProvider';
import { Controller } from '@tsoa/runtime';
import { DiagnosticsController } from './api/controllers/DiagnosticsController';
import { ExampleController } from './api/controllers/ExampleController';
import { IAuthentication } from './api/auth/IAuthentication';
import { IUserRepository } from './domain/IUserRepository';
import { Settings } from './settings-types';
import { TsoaAuthentication } from './api/auth/TsoaAuthentication';
import { UserRepository } from './infra/github/UserRepository';
import { octokitFactory } from './infra/github/OctokitFactory';

const SERVER_PREFIX = 'gha-build-monitor';
const SERVER_NAME = 'gha-build-monitor';

export class CompositionRoot implements IControllerFactory {
  private constructor(
    private readonly settings: Settings,
    private readonly meta: MetaInfo,
    private readonly userRepo: IUserRepository
  ) {}

  public static forProd(settings: Settings): CompositionRoot {
    return new CompositionRoot(settings, metaFromPackageJson, new UserRepository(octokitFactory));
  }

  public static forTesting(settings: Settings, userRepo: IUserRepository): CompositionRoot {
    return new CompositionRoot(settings, metaFromPackageJson, userRepo);
  }

  public get<T>(controllerConstructor: ConstructorFunction<T>): Controller {
    switch (controllerConstructor.name) {
      case ExampleController.name:
        return new ExampleController();
      case BasicBuildInfoController.name:
        return new BasicBuildInfoController({
          id: `${SERVER_PREFIX}/${this.settings.catlight.installationId}`,
          name: SERVER_NAME,
          version: this.meta.version,
        });
      case DiagnosticsController.name:
        return new DiagnosticsController(this.meta);
      default:
        // eslint-disable-next-line no-console
        console.error('Cannot create an instance of ', controllerConstructor);
        throw new Error(`How do I create an instance of ${controllerConstructor} ?? `);
    }
  }

  public getAuthentication(): IAuthentication {
    return new TsoaAuthentication([new BearerAuthenticationProvider(this.userRepo)]);
  }
}
