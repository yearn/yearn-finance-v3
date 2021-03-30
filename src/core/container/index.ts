import * as awilix from 'awilix';

import { BlocknativeWalletImpl } from '@frameworks/blocknative';
import { EthersWeb3ProviderImpl } from '@frameworks/ethers';
import { GetSupportedVaults, GetUserVaults } from '@services';
import { getConfig } from '@config';
import { DIContainer, ContextContainer, ServiceContainer, ConfigContainer } from '@types';

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
      web3Provider: awilix.asClass(EthersWeb3ProviderImpl).singleton(),
    });
  }

  private registerServices() {
    this.container.register({
      getSupportedVaults: awilix.asClass(GetSupportedVaults),
      getUserVaults: awilix.asClass(GetUserVaults),
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
      web3Provider: this.container.cradle.web3Provider,
    };
  }

  get services(): ServiceContainer {
    return {
      getSupportedVaults: this.container.cradle.getSupportedVaults,
      getUserVaults: this.container.cradle.getUserVaults,
    };
  }

  get config(): ConfigContainer {
    return {
      ...this.container.cradle.config,
    };
  }
}
