import { Wallet, Config, GetSupportedVaultsService, Web3Provider } from '@types';
import { GetUserVaultsService } from './Service';

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
}

export interface ConfigContainer extends Config {}
