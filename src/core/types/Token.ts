import { Address } from './Blockchain';

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
  isZapable: boolean;
  allowancesMap: { [tokenAddress: string]: string };
  supported: {
    portalsZapIn?: boolean;
    portalsZapOut?: boolean;
    ftmApeZap?: boolean;
  };
}

export interface TokenDynamicData {
  address: Address;
  priceUsdc: string;
}
