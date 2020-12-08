import { ApiDependencies, CompositionRoot } from '../../composition-root';
import { Express } from 'express';
import { InMemoryRepoRepository } from '../../infra/memory/InMemoryRepoRepository';
import { InMemoryUserRepository } from '../../infra/memory/InMemoryUserRepository';
import { Settings } from '../../settings-types';
import { buildWebApp } from '../server';
import supertest from 'supertest';

export type TestAgent = supertest.SuperTest<supertest.Test>;

export const TEST_SETTINGS: Settings = Object.freeze({
  catlight: {
    installationId: 'TEST_INSTALLATION_ID',
  },
});

function getDependenciesForTesting(partial: Partial<ApiDependencies>): ApiDependencies {
  return {
    repoRepo: partial?.repoRepo ?? new InMemoryRepoRepository(),
    userRepo: partial.userRepo ?? new InMemoryUserRepository(),
  };
}

export class ApiTestTools {
  private static createTestWebApp(
    settings: Settings,
    dependencies: Partial<ApiDependencies>
  ): Express {
    const compositionRoot = CompositionRoot.forTesting(
      settings,
      getDependenciesForTesting(dependencies)
    );
    return buildWebApp(compositionRoot);
  }

  public static createTestAgent(
    dependencies: Partial<ApiDependencies> = {},
    settings: Settings = TEST_SETTINGS
  ): TestAgent {
    return supertest.agent(ApiTestTools.createTestWebApp(settings, dependencies));
  }
}
