import * as awilix from 'awilix';

import { BlocknativeWalletImpl } from '@frameworks/blocknative';
import { getConfig } from '@config';
import { DIContainer, Wallet, Config } from '@types';

export class Container implements DIContainer {
  private container: awilix.AwilixContainer;

  constructor() {
    this.container = awilix.createContainer({
      injectionMode: awilix.InjectionMode.PROXY,
    });

    this.container.register({
      wallet: awilix.asClass(BlocknativeWalletImpl).singleton(),
      config: awilix.asValue(getConfig()),
    });
  }

  get wallet(): Wallet {
    return this.container.cradle.wallet;
  }

  get config(): Config {
    return {
      ...this.container.cradle.config,
    };
  }
}
