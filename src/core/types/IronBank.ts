import { EthereumAddress, TokenView } from '@types';

export interface IronBankMarketView {
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
  userBalance: string;
  userDeposited: string;
  userDepositedUsdc: string;
  allowancesMap: { [spenderAddress: string]: string };
  enteredMarket: boolean;
  borrowLimit: string;

  // underlyingToken
  token: TokenView;
}
