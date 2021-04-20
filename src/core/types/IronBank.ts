import { EthereumAddress } from '@types';

export interface IronBank extends IronBankData {
  cyTokens: CyToken[];
}

export interface IronBankData {
  borrowLimit: string;
  borrowLimitUsed: string;
}

export interface CyToken {
  address: EthereumAddress;
  decimals: string;
  name: string;
  symbol: string;
  underlyingTokenAddress: EthereumAddress;
  lendApy: string;
  borrowApy: string;
  liquidity: string;
  collateralFactor: string;
  reserveFactor: string;
  isActive: string;
  exchangeRate: string;
}

export interface CyTokenData extends CyTokenStaticData, CyTokenDynamicData {}

export interface CyTokenStaticData {
  address: EthereumAddress;
  decimals: string;
  name: string;
  symbol: string;
  underlyingTokenAddress: EthereumAddress;
}

export interface CyTokenDynamicData {
  address: EthereumAddress;
  lendApy: string;
  borrowApy: string;
  liquidity: string;
  collateralFactor: string;
  reserveFactor: string;
  isActive: string;
  exchangeRate: string;
}
