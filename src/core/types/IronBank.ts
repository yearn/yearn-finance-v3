import { EthereumAddress, TokenView, UserTokenData } from '@types';

export interface IronBank extends IronBankData {
  cyTokens: CyTokenView[];
}

export interface IronBankData {
  supportedCyTokens: EthereumAddress[];
}

export interface UserIronBankData {
  borrowLimit: string;
  borrowLimitUsed: string;
}

export interface CyTokenView {
  address: EthereumAddress;
  decimals: string;
  name: string;
  symbol: string;
  lendApy: string;
  borrowApy: string;
  liquidity: string;
  collateralFactor: string;
  reserveFactor: string;
  isActive: boolean;
  exchangeRate: string;
  // user
  userDeposited: string;
  userDepositedUsdc: string;
  allowancesMap: { [spenderAddress: string]: string };
  enteredMarket: boolean;
  borrowLimit: string;

  // underlyingToken
  token: TokenView;
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
