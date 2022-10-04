import * as awilix from 'awilix';

import { BlocknativeWalletImpl } from '@frameworks/blocknative';
import { EthersWeb3ProviderImpl } from '@frameworks/ethers';
import { YearnSdkImpl } from '@frameworks/yearnSdk';
import {
  CreditLineServiceImpl,
  TokenServiceImpl,
  UserServiceImpl,
  VaultServiceImpl,
  GasServiceImpl,
  TransactionServiceImpl,
  SpigotedLineServiceImpl,
  EscrowServiceImpl,
  InterestRateCreditServiceImpl,
  LineFactoryServiceImpl,
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
      creditLineService: awilix.asClass(CreditLineServiceImpl),
      spigotedLineService: awilix.asClass(SpigotedLineServiceImpl),
      escrowService: awilix.asClass(EscrowServiceImpl),
      tokenService: awilix.asClass(TokenServiceImpl),
      userService: awilix.asClass(UserServiceImpl),
      vaultService: awilix.asClass(VaultServiceImpl),
      gasService: awilix.asClass(GasServiceImpl),
      transactionService: awilix.asClass(TransactionServiceImpl),
      interestRateCreditService: awilix.asClass(InterestRateCreditServiceImpl),
      lineServices: awilix.asClass(LineFactoryServiceImpl),
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
      creditLineService: this.container.cradle.creditLineService,
      tokenService: this.container.cradle.tokenService,
      userService: this.container.cradle.userService,
      vaultService: this.container.cradle.vaultService,
      gasService: this.container.cradle.gasService,
      transactionService: this.container.cradle.transactionService,
      spigotedLineService: this.container.cradle.spigotedLineService,
      escrowService: this.container.cradle.escrowService,
      interestRateCreditService: this.container.cradle.interestRateCreditService,
      lineServices: this.container.cradle.lineServices,
    };
  }

  get config(): ConfigContainer {
    return {
      ...this.container.cradle.config,
    };
  }
}
