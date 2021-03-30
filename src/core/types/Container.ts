import {
  Wallet,
  Config,
  GetSupportedVaultsService,
  Web3Provider,
  GetSupportedTokensService,
  GetUserVaultsService,
} from '@types';

export interface DIContainer {
  context: ContextContainer;
  services: ServiceContainer;
  config: ConfigContainer;
}

export interface ContextContainer {
  wallet: Wallet;
  web3Provider: Web3Provider;
}
export interface ServiceContainer {
  getSupportedVaults: GetSupportedVaultsService;
  getUserVaults: GetUserVaultsService;
  getSupportedTokens: GetSupportedTokensService;
}

export interface ConfigContainer extends Config {}
