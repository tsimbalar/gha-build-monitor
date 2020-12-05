import { Express } from 'express';
import { buildWebApp } from '../api/server';
import supertest from 'supertest';

export type TestAgent = supertest.SuperTest<supertest.Test>;

export class ApiTestTools {
  private static createTestWebApp(): Express {
    return buildWebApp();
  }

  public static createTestAgent(): TestAgent {
    return supertest.agent(ApiTestTools.createTestWebApp());
  }
}
