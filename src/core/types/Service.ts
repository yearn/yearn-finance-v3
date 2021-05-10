import {
  VaultData,
  VaultDynamicData,
  UserVaultData,
  CyTokenData,
  UserCyTokenData,
  TokenDynamicData,
  EthereumAddress,
  Wei,
} from '@types';
import { Token } from '@yfi/sdk';

export interface UserService {}

export interface VaultService {
  getSupportedVaults: () => Promise<VaultData[]>;
  getVaultsDynamicData: (props: any) => Promise<VaultDynamicData[]>;
  getUserVaultsData: ({ userAddress }: { userAddress: EthereumAddress }) => Promise<UserVaultData[]>;
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
  getTokensDynamicData: (props: any) => Promise<TokenDynamicData[]>;
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
  getSupportedCyTokens: () => Promise<CyTokenData[]>;
  getUserCyTokensData: ({ userAddress }: { userAddress: EthereumAddress }) => Promise<UserCyTokenData[]>;
  getIronBankData: ({ userAddress }: { userAddress: EthereumAddress | undefined }) => Promise<any>;
  // getCyTokensDynamicData: () => Promise<CyTokenDynamicData[]>;
  // approveSupply: (props: ApproveSupplyProps) => Promise<void>;
  // supply: (props: SupplyProps) => Promise<void>;
  // withdraw: (props: WithdrawProps) => Promise<void>;
  // borrow
  // repay
}
