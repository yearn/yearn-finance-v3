import {
  Wallet,
  Config,
  Web3Provider,
  UserService,
  LoanService,
  VaultService,
  TokenService,
  GasService,
  TransactionService,
  SubscriptionService,
  YearnSdk,
} from '@types';

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
  loanService: LoanService;
  gasService: GasService;
  transactionService: TransactionService;
}

export interface ConfigContainer extends Config {}
