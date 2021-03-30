import { EthereumAddress } from '@types';

export interface TokenData {
  address: EthereumAddress;
  name: string;
  symbol: string;
  decimals: string;
  icon: string;
}
