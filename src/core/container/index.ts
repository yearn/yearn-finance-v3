import * as awilix from 'awilix';

import { BlocknativeWalletImpl } from '@frameworks/blocknative';
import { EthersWeb3ProviderImpl } from '@frameworks/ethers';
import { YearnSdkImpl } from '@frameworks/yearnSdk';
import {
  TokenServiceImpl,
  UserServiceImpl,
  VaultServiceImpl,
  IronBankServiceImpl,
  LabServiceImpl,
  GasServiceImpl,
  TransactionServiceImpl,
  SubscriptionServiceImpl,
} from '@services';
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
      yearnSdk: awilix.asClass(YearnSdkImpl).singleton(),
    });
  }

  private registerServices() {
    this.container.register({
      tokenService: awilix.asClass(TokenServiceImpl),
      userService: awilix.asClass(UserServiceImpl),
      vaultService: awilix.asClass(VaultServiceImpl),
      ironBankService: awilix.asClass(IronBankServiceImpl),
      labService: awilix.asClass(LabServiceImpl),
      gasService: awilix.asClass(GasServiceImpl),
      transactionService: awilix.asClass(TransactionServiceImpl),
      subscriptionService: awilix.asClass(SubscriptionServiceImpl),
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
      yearnSdk: this.container.cradle.yearnSdk,
    };
  }

  get services(): ServiceContainer {
    return {
      tokenService: this.container.cradle.tokenService,
      userService: this.container.cradle.userService,
      vaultService: this.container.cradle.vaultService,
      ironBankService: this.container.cradle.ironBankService,
      labService: this.container.cradle.labService,
      gasService: this.container.cradle.gasService,
      transactionService: this.container.cradle.transactionService,
      subscriptionService: this.container.cradle.subscriptionService,
    };
  }

  get config(): ConfigContainer {
    return {
      ...this.container.cradle.config,
    };
  }
}
