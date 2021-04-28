import { EthereumAddress } from '@types';

export interface TokenData {
  address: EthereumAddress;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  priceUsdc: string;
  supported: {
    zapper: boolean;
  };
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
  decimals: number;
  icon: string;
  balance: string;
  balanceUsdc: string;
  allowancesMap: { [tokenAddress: string]: string };
}

export interface TokenDynamicData {
  address: EthereumAddress;
  priceUsdc: string;
}
