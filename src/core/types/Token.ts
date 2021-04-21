import { EthereumAddress } from '@types';

export interface TokenData {
  address: EthereumAddress;
  name: string;
  symbol: string;
  decimals: string;
  icon: string;
  priceUsdc: string;
}

export interface UserTokenData {
  address: string;
  balance: string;
  balanceUsdc: string;
  allowancesMap: { [spenderAddress: string]: string };
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

export interface TokenDynamicData {
  address: EthereumAddress;
  priceUsdc: string;
}
