import { ConstructorFunction, IControllerFactory } from './api/ioc/IControllerFactory';
import { MetaInfo, meta as metaFromPackageJson } from './meta';
import { BearerAuthenticationProvider } from './api/auth/BearerAuthenticationProvider';
import { BuildInfoController } from './api/controllers/BuildInfoController';
import { CachedCommitAuthorRepository } from './infra/caching/CachedCommitAuthorRepository';
import { CachedRepoRepository } from './infra/caching/CachedRepoRepository';
import { CommitAuthorRepository } from './infra/github/CommitAuthorRepository';
import { Controller } from '@tsoa/runtime';
import { DiagnosticsController } from './api/controllers/DiagnosticsController';
import { DynamicBuildInfoController } from './api/controllers/DynamicBuildInfoController';
import { ExampleController } from './api/controllers/ExampleController';
import { IAuthentication } from './api/auth/IAuthentication';
import { IRepoRepository } from './domain/IRepoRepository';
import { IUserRepository } from './domain/IUserRepository';
import { IWorkflowRunRepository } from './domain/IWorkflowRunRepository';
import { IndexController } from './api/controllers/IndexController';
import { RepoRepository } from './infra/github/RepoRepository';
import { Settings } from './settings-types';
import { TsoaAuthentication } from './api/auth/TsoaAuthentication';
import { UserRepository } from './infra/github/UserRepository';
import { WorkflowRunRepository } from './infra/github/WorkflowRunRepository';
import { getOctokitFactory } from './infra/github/OctokitFactory';

export interface ApiDependencies {
  readonly userRepo: IUserRepository;
  readonly repoRepo: IRepoRepository;
  readonly workflowRunRepo: IWorkflowRunRepository;
}

export class CompositionRoot implements IControllerFactory {
  private readonly dependencies: ApiDependencies;

  private constructor(
    private readonly settings: Settings,
    private readonly meta: MetaInfo,
    dependencies: ApiDependencies
  ) {
    this.dependencies = {
      repoRepo: new CachedRepoRepository(dependencies.repoRepo),
      userRepo: dependencies.userRepo,
      workflowRunRepo: dependencies.workflowRunRepo,
    };
  }

  public static forProd(settings: Settings): CompositionRoot {
    const octokitFactory = getOctokitFactory(metaFromPackageJson);
    return new CompositionRoot(settings, metaFromPackageJson, {
      userRepo: new UserRepository(octokitFactory),
      repoRepo: new RepoRepository(octokitFactory),
      workflowRunRepo: new WorkflowRunRepository(
        octokitFactory,
        new CachedCommitAuthorRepository(new CommitAuthorRepository(octokitFactory))
      ),
    });
  }

  public static forTesting(settings: Settings, dependencies: ApiDependencies): CompositionRoot {
    return new CompositionRoot(settings, metaFromPackageJson, dependencies);
  }

  public get<T>(controllerConstructor: ConstructorFunction<T>): Controller {
    switch (controllerConstructor.name) {
      case IndexController.name:
        return new IndexController(this.meta);
      case ExampleController.name:
        return new ExampleController();
      case DynamicBuildInfoController.name:
        return new DynamicBuildInfoController(
          this.meta,
          this.dependencies.repoRepo,
          this.dependencies.workflowRunRepo
        );
      case BuildInfoController.name:
        return new BuildInfoController(
          this.meta,
          this.dependencies.repoRepo,
          this.dependencies.workflowRunRepo
        );
      case DiagnosticsController.name:
        return new DiagnosticsController(this.meta);
      default:
        // eslint-disable-next-line no-console
        console.error('Cannot create an instance of ', controllerConstructor);
        throw new Error(`How do I create an instance of ${controllerConstructor} ?? `);
    }
  }

  public getAuthentication(): IAuthentication {
    return new TsoaAuthentication([new BearerAuthenticationProvider(this.dependencies.userRepo)]);
  }
}
