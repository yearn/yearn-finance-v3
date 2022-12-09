import {
  Wallet,
  Config,
  Web3Provider,
  UserService,
  VaultService,
  TokenService,
  LabService,
  VotingEscrowService,
  GaugeService,
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
  labService: LabService;
  votingEscrowService: VotingEscrowService;
  gaugeService: GaugeService;
  gasService: GasService;
  transactionService: TransactionService;
  subscriptionService: SubscriptionService;
}

export interface ConfigContainer extends Config {}
