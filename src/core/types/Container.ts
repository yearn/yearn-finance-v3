import { Wallet, Config, GetSupportedVaultsService } from '@types';

export interface DIContainer {
  context: ContextContainer;
  services: ServiceContainer;
  config: ConfigContainer;
}

export interface ContextContainer {
  wallet: Wallet;
}
export interface ServiceContainer {
  getSupportedVaults: GetSupportedVaultsService;
}

export interface ConfigContainer extends Config {}
