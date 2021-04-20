import { EthereumAddress, UserTokenData } from '@types';

export interface UserIronBankData {
  address: EthereumAddress;
  suppliedBalance: string;
  suppliedBalanceUsdc: string;
  borrowedBalance: string;
  borrowedBalanceUsdc: string;
  allowancesMap: { [spenderAddress: string]: string };
  tokenPosition: UserTokenData;
  enteredMarket: boolean;
  borrowLimit: string;
}
