import { Wallet, Config, Web3Provider, UserService, VaultService, TokenService, IronBankService, Yearn } from '@types';
import { yearnSdkMock } from '../frameworks/yearnSdk/yearnSdkMock';

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
  ironBankService: IronBankService;
}

export interface ConfigContainer extends Config {}

export type YearnSdk = Omit<Yearn<1>, 'tokens' | 'vaults'> & typeof yearnSdkMock; // TODO use only Yearn<1> when sdk ready.
