import { EthereumAddress, Token, UserTokenData } from '@types';

export interface IronBank extends IronBankData {
  cyTokens: CyToken[];
}

export interface IronBankData {
  supportedCyTokens: EthereumAddress[];
}

export interface UserIronBankData {
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
  // user
  suppliedBalance: string;
  suppliedBalanceUsdc: string;
  borrowedBalance: string;
  borrowedBalanceUsdc: string;
  allowancesMap: { [spenderAddress: string]: string };
  enteredMarket: boolean;
  borrowLimit: string;
  // underlyingToken
  token: Token;
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

export interface UserCyTokenData {
  address: EthereumAddress;
  suppliedBalance: string;
  suppliedBalanceUsdc: string;
  borrowedBalance: string;
  borrowedBalanceUsdc: string;
  allowancesMap: { [spenderAddress: string]: string };
  enteredMarket: boolean;
  borrowLimit: string;
}
