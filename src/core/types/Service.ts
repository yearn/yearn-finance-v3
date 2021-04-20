import { VaultData, TokenData, UserVaultData, EthereumAddress, Wei } from '@types';
import { TokenDynamicData } from './Token';
import { VaultDynamicData } from './Vault';

export interface UserService {
  getUserVaultsData: ({ userAddress }: { userAddress: EthereumAddress }) => Promise<UserVaultData[]>;
  // getUserTokensData:
}

export interface VaultService {
  getSupportedVaults: () => Promise<VaultData[]>;
  approveDeposit: (props: ApproveDepositProps) => Promise<void>;
  deposit: (props: DepositProps) => Promise<void>;
  withdraw: (props: WithdrawProps) => Promise<void>;
  getVaultsDynamicData: (props: any) => Promise<VaultDynamicData[]>;
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
