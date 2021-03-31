import { EthereumAddress } from '@types';
import { Token } from './Token';

export interface VaultData {
  address: EthereumAddress;
  name: string;
  version: string;
  typeId: string;
  balance: string;
  balanceUsdc: string;
  token: EthereumAddress;
  apyData: any;
  depositLimit: string;
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
  token: Token;
}
