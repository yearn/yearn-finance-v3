import * as awilix from 'awilix';

import { BlocknativeWalletImpl } from '@frameworks/blocknative';
import { GetSupportedVaults } from '@services';
import { getConfig } from '@config';
import {
  DIContainer,
  ContextContainer,
  ServiceContainer,
  ConfigContainer,
} from '@types';

export class Container implements DIContainer {
  private container: awilix.AwilixContainer;

  constructor() {
    this.container = awilix.createContainer({
      injectionMode: awilix.InjectionMode.PROXY,
    });

    this.registerContext();
    this.registerServices();
    this.registerConfig();
  }

  private registerContext() {
    this.container.register({
      wallet: awilix.asClass(BlocknativeWalletImpl).singleton(),
    });
  }

  private registerServices() {
    this.container.register({
      getSupportedVaults: awilix.asClass(GetSupportedVaults),
    });
  }

  private registerConfig() {
    this.container.register({
      config: awilix.asValue(getConfig()),
    });
  }

  get context(): ContextContainer {
    return {
      wallet: this.container.cradle.wallet,
    };
  }

  get services(): ServiceContainer {
    return {
      getSupportedVaults: this.container.cradle.getSupportedVaults,
    };
  }

  get config(): ConfigContainer {
    return {
      ...this.container.cradle.config,
    };
  }
}
