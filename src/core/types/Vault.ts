import { EthereumAddress } from '@types';
import { Token } from './Token';

export type VaultType = 'VAULT_V1' | 'VAULT_V2';

export interface VaultData {
  address: EthereumAddress;
  name: string;
  version: string;
  typeId: VaultType;
  balance: string;
  balanceUsdc: string;
  token: EthereumAddress;
  apyData: any;
  depositLimit: string;
  pricePerShare: string;
}
export interface Vault {
  address: EthereumAddress;
  name: string;
  vaultBalance: string;
  vaultBalanceUsdc: string;
  depositLimit: string;
  apyData: any;
  userDeposited: string;
  userDepositedUsdc: string;
  allowancesMap: { [vaultAddress: string]: string };
  approved: boolean;
  token: Token;
}

export interface VaultDynamicData {
  address: EthereumAddress;
  balance: string;
  balanceUsdc: string;
  apyData: any;
  depositLimit: string;
  pricePerShare: string;
}
