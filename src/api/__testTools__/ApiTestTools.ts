import { CompositionRoot } from '../../composition-root';
import { Express } from 'express';
import { Settings } from '../../settings-types';
import { buildWebApp } from '../server';
import supertest from 'supertest';

export type TestAgent = supertest.SuperTest<supertest.Test>;

export const TEST_SETTINGS: Settings = Object.freeze({
  catlight: {
    installationId: 'TEST_INSTALLATION_ID',
  },
});

export class ApiTestTools {
  private static createTestWebApp(settings: Settings): Express {
    const compositionRoot = new CompositionRoot(settings);
    return buildWebApp(compositionRoot);
  }

  public static createTestAgent(settings: Settings = TEST_SETTINGS): TestAgent {
    return supertest.agent(ApiTestTools.createTestWebApp(settings));
  }
}
