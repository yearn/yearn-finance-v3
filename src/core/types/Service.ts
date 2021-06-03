import { TokenDynamicData, EthereumAddress, Wei, Position, Token, Vault, VaultDynamic, Balance, Integer } from '@types';
import { CyTokenUserMetadata, IronBankMarket, IronBankMarketDynamic, IronBankPosition } from '@yfi/sdk';
import BigNumber from 'bignumber.js';

export interface UserService {}

export interface VaultService {
  getSupportedVaults: () => Promise<Vault[]>;
  getVaultsDynamicData: (props: any) => Promise<VaultDynamic[]>;
  getUserVaultsPositions: ({
    userAddress,
    vaultAddresses,
  }: {
    userAddress: EthereumAddress;
    vaultAddresses?: string[];
  }) => Promise<Position[]>;
  deposit: (props: DepositProps) => Promise<void>;
  withdraw: (props: WithdrawProps) => Promise<void>;
  // approveZapIn:
  // zapIn:
  // zapOut:
  // approveMigrate:
  // migrate:
}

export interface TokenService {
  getSupportedTokens: () => Promise<Token[]>;
  getTokensDynamicData: (props: string[]) => Promise<TokenDynamicData[]>;
  getUserTokensData: (accountAddress: string, tokenAddress?: string[]) => Promise<Balance[]>;
  getTokenAllowance: (accountAddress: string, tokenAddress: string, spenderAddress: string) => Promise<Integer>;
  approve: (props: ApproveProps) => Promise<void>;
  // getTokenRates:
}

export interface DepositProps {
  tokenAddress: EthereumAddress;
  vaultAddress: EthereumAddress;
  amount: Wei;
}

export interface WithdrawProps {
  tokenAddress: EthereumAddress;
  vaultAddress: EthereumAddress;
  amountOfShares: Wei;
}

export interface ApproveProps {
  tokenAddress: EthereumAddress;
  spenderAddress: EthereumAddress;
  amount: Wei;
}

export interface IronBankTransactionProps {
  userAddress: EthereumAddress;
  marketAddress: string;
  amount: Wei;
  action: 'supply' | 'borrow' | 'withdraw' | 'repay';
}
export interface IronBankGenericGetUserDataProps {
  userAddress: EthereumAddress;
  marketAddresses?: string[];
}
export interface EnterMarketsProps {
  userAddress: EthereumAddress;
  marketAddresses: string[];
}

export interface IronBankService {
  getSupportedMarkets: () => Promise<IronBankMarket[]>;
  getUserMarketsPositions: (props: IronBankGenericGetUserDataProps) => Promise<Position[]>;
  getUserMarketsMetadata: (props: IronBankGenericGetUserDataProps) => Promise<CyTokenUserMetadata[]>;
  getIronBankData: ({ userAddress }: { userAddress: EthereumAddress }) => Promise<IronBankPosition>;
  getMarketsDynamicData: (marketAddresses: string[]) => Promise<IronBankMarketDynamic[]>;
  executeTransaction: (props: IronBankTransactionProps) => Promise<any>;
  enterMarkets: (props: EnterMarketsProps) => Promise<any>;
}

export interface SubscriptionProps {
  module: string;
  event: string;
  action: (...args: any[]) => void;
}

export interface SubscriptionService {
  subscribe: (props: SubscriptionProps) => void;
  unsubscribe: (props: SubscriptionProps) => void;
}
