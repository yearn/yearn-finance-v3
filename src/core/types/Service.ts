import {
  VaultData,
  VaultDynamicData,
  TokenData,
  UserVaultData,
  CyTokenData,
  UserCyTokenData,
  TokenDynamicData,
  EthereumAddress,
  Wei,
} from '@types';

export interface UserService {}

export interface VaultService {
  getSupportedVaults: () => Promise<VaultData[]>;
  getVaultsDynamicData: (props: any) => Promise<VaultDynamicData[]>;
  getUserVaultsData: ({ userAddress }: { userAddress: EthereumAddress }) => Promise<UserVaultData[]>;
  approveDeposit: (props: ApproveDepositProps) => Promise<void>;
  deposit: (props: DepositProps) => Promise<void>;
  withdraw: (props: WithdrawProps) => Promise<void>;
  // approveZapIn:
  // zapIn:
  // zapOut:
  // approveMigrate:
  // migrate:
}

export interface TokenService {
  getSupportedTokens: () => Promise<TokenData[]>;
  getTokensDynamicData: (props: any) => Promise<TokenDynamicData[]>;
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

export interface ApproveDepositProps {
  tokenAddress: EthereumAddress;
  vaultAddress: EthereumAddress;
  amount: Wei;
}

export interface IronBankService {
  getSupportedCyTokens: () => Promise<CyTokenData[]>;
  getUserCyTokensData: ({ userAddress }: { userAddress: EthereumAddress }) => Promise<UserCyTokenData[]>;
  // getCyTokensDynamicData: () => Promise<CyTokenDynamicData[]>;
  // approveSupply: (props: ApproveSupplyProps) => Promise<void>;
  // supply: (props: SupplyProps) => Promise<void>;
  // withdraw: (props: WithdrawProps) => Promise<void>;
  // borrow
  // repay
}
