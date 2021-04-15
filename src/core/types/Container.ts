import { Yearn } from '@yfi/sdk';

import { Wallet, Config, Web3Provider, UserService, VaultService, TokenService } from '@types';

export interface DIContainer {
  context: ContextContainer;
  services: ServiceContainer;
  config: ConfigContainer;
}

export interface ContextContainer {
  wallet: Wallet;
  web3Provider: Web3Provider;
  yearnSdk: YearnSdk;
}
export interface ServiceContainer {
  userService: UserService;
  vaultService: VaultService;
  tokenService: TokenService;
}

export interface ConfigContainer extends Config {}

export type YearnSdk = Yearn<1>;
