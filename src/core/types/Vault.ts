import { EthereumAddress } from '@types';

export interface VaultData {
  address: EthereumAddress;
  name: string;
  version: string;
  typeId: string;
  balance: string;
  balanceUsdc: string;
  token: EthereumAddress;
  apyData: any;
}
