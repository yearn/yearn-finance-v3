import {
  UserCyTokenData,
  TokenDynamicData,
  EthereumAddress,
  Wei,
  Position,
  Token,
  Vault,
  VaultDynamic,
  Balance,
  Integer,
} from '@types';
import { IronBankMarket } from '@yfi/sdk';

export interface UserService {}

export interface VaultService {
  getSupportedVaults: () => Promise<Vault[]>;
  getVaultsDynamicData: (props: any) => Promise<VaultDynamic[]>;
  getUserVaultsData: ({
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

export interface IronBankService {
  getSupportedCyTokens: () => Promise<IronBankMarket[]>;
  getUserCyTokensData: ({
    userAddress,
    marketAddresses,
  }: {
    userAddress: EthereumAddress;
    marketAddresses?: string[];
  }) => Promise<Position[]>;
  getIronBankData: ({ userAddress }: { userAddress: EthereumAddress | undefined }) => Promise<any>;
  // getCyTokensDynamicData: () => Promise<CyTokenDynamicData[]>;
  // approveSupply: (props: ApproveSupplyProps) => Promise<void>;
  // supply: (props: SupplyProps) => Promise<void>;
  // withdraw: (props: WithdrawProps) => Promise<void>;
  // borrow
  // repay
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
