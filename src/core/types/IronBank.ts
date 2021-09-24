import { Address, PositionView, TokenView } from '@types';

export interface IronBankMarketView extends PositionView, Omit<GeneralIronBankMarketView, 'LEND' | 'BORROW'> {}

export interface GeneralIronBankMarketView {
  address: Address;
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
  allowancesMap: { [spenderAddress: string]: string };
  enteredMarket: boolean;
  LEND: PositionView;
  BORROW: PositionView;
  // underlyingToken
  token: TokenView;
}
