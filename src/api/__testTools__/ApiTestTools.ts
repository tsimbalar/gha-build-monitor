import { CompositionRoot } from '../../composition-root';
import { Express } from 'express';
import { IUserRepository } from '../../domain/IUserRepository';
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

export interface ApiDependencies {
  userRepo?: IUserRepository;
}

export class ApiTestTools {
  private static createTestWebApp(settings: Settings, dependencies: ApiDependencies): Express {
    const compositionRoot = CompositionRoot.forTesting(
      settings,
      dependencies.userRepo ?? new InMemoryUserRepository()
    );
    return buildWebApp(compositionRoot);
  }

  public static createTestAgent(
    dependencies: ApiDependencies = {},
    settings: Settings = TEST_SETTINGS
  ): TestAgent {
    return supertest.agent(ApiTestTools.createTestWebApp(settings, dependencies));
  }
}
