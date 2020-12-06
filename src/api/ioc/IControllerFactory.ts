import { Controller } from '@tsoa/runtime';

export type ConstructorFunction<T> = new (...args: unknown[]) => T;

export interface IControllerFactory {
  get<T>(controllerConstructor: ConstructorFunction<T>): Controller;
}
