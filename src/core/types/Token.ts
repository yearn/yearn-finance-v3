import { EthereumAddress } from '@types';

export interface TokenData {
  address: EthereumAddress;
  name: string;
  symbol: string;
  decimals: string;
  icon: string;
}

export interface Token {
  address: EthereumAddress;
  name: string;
  symbol: string;
  decimals: string;
  icon: string;
  balance: string;
  balanceUsdc: string;
  allowancesMap: { [tokenAddress: string]: string };
}
