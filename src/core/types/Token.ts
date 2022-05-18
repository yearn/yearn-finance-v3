import { Address } from '@types';

export interface UserTokenData {
  address: string;
  balance: string;
  balanceUsdc: string;
  allowancesMap: { [spenderAddress: string]: string };
}

export interface TokenView {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  icon: string | undefined;
  balance: string;
  balanceUsdc: string;
  priceUsdc: string;
  categories: string[];
  description: string;
  website: string;
  zaps: {
    zapper?: boolean;
    zapperZapIn?: boolean;
    zapperZapOut?: boolean;
    ftmApeZap?: boolean;
  };
  allowancesMap: { [tokenAddress: string]: string };
}

export interface TokenDynamicData {
  address: Address;
  priceUsdc: string;
}
