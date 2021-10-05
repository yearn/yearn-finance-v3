import { AllowancesMap, LabsPositionsTypes } from './State';
import { TokenView } from './Token';

// This General naming means it has the positions inside as keys
export interface GeneralLabView {
  address: string;
  name: string;
  displayName: string;
  displayIcon: string;
  defaultDisplayToken: string;
  decimals: string;
  labBalance: string;
  labBalanceUsdc: string;
  apyData: string;
  allowancesMap: AllowancesMap;
  pricePerShare: string;
  allowZapIn: boolean;
  allowZapOut: boolean;
  mainPositionKey: LabsPositionsTypes;
  DEPOSIT: {
    userBalance: string;
    userDeposited: string;
    userDepositedUsdc: string;
  };
  YIELD: {
    userBalance: string;
    userDeposited: string;
    userDepositedUsdc: string;
  };
  STAKE: {
    userBalance: string;
    userDeposited: string;
    userDepositedUsdc: string;
  };
  token: TokenView;
}
