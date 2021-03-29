import { EthereumAddress } from '@types';

export interface Token {
  address: EthereumAddress;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
}
