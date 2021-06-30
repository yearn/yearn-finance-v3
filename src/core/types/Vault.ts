import { EthereumAddress } from '@types';
import { Usdc } from '@yfi/sdk';
import { TokenView } from './Token';

export type VaultType = 'VAULT_V1' | 'VAULT_V2';

export interface VaultData extends VaultDynamicData {
  address: EthereumAddress;
  name: string;
  version: string;
  typeId: VaultType;
  token: EthereumAddress;
  symbol: string;
}

export interface VaultView {
  address: EthereumAddress;
  name: string;
  decimals: string;
  vaultBalance: string;
  vaultBalanceUsdc: string;
  depositLimit: string;
  emergencyShutdown: boolean;
  apyData: any;
  userBalance: string;
  userDeposited: string;
  userDepositedUsdc: string;
  earned: Usdc;
  allowancesMap: { [vaultAddress: string]: string };
  approved: boolean;
  token: TokenView;
}

export interface VaultDynamicData {
  address: EthereumAddress;
  balance: string;
  balanceUsdc: string;
  apyData: any;
  depositLimit: string;
  pricePerShare: string;
  migrationAvailable: boolean;
  latestVaultAddress: string;
  emergencyShutdown: boolean;
}

export interface VaultRecommendation {
  tokenAddress: string;
  vaultAddress: string;
  apy: string;
  symbol: string;
}
export interface VaultsRecommendations {
  name: string;
  apy: string;
  symbol: string;
}
