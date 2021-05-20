import { EthereumAddress } from '@types';

// TODO deprecated
// export interface TokenData {
//   address: EthereumAddress;
//   name: string;
//   symbol: string;
//   decimals: number;
//   icon: string;
//   priceUsdc: string;
//   supported: {
//     zapper: boolean;
//   };
// }

export interface UserTokenData {
  address: string;
  balance: string;
  balanceUsdc: string;
  allowancesMap: { [spenderAddress: string]: string };
}

export interface TokenView {
  address: EthereumAddress;
  name: string;
  symbol: string;
  decimals: number;
  icon: string | undefined;
  balance: string;
  balanceUsdc: string;
  priceUsdc: string;
  allowancesMap: { [tokenAddress: string]: string };
}

export interface TokenDynamicData {
  address: EthereumAddress;
  priceUsdc: string;
}
