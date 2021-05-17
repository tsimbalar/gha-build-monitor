/* eslint-disable no-console */
// needed for tsoa to know how to create controller instances

import { ConstructorFunction, IControllerFactory } from './ioc/IControllerFactory';
import { IocContainer } from '@tsoa/runtime';

class IocContainerAdapter implements IocContainer {
  public constructor(private readonly controllerFactory: IControllerFactory) {}

  public get<T>(controller: { prototype: T }): T {
    return this.controllerFactory.get<T>(
      controller as unknown as ConstructorFunction<T>
    ) as unknown as T;
  }
}

export function RegisterControllerFactory(controllerFactory: IControllerFactory): void {
  iocContainer = new IocContainerAdapter(controllerFactory);
}

// tsoa wants an export named `iocContainer`
export let iocContainer: IocContainer = {
  get: () => {
    throw new Error('Calling iocContainer.get() too early !');
  },
};
