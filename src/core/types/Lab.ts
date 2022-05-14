import { Apy, PositionView } from '@types';

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
  apyMetadata?: Apy;
  allowancesMap: AllowancesMap;
  pricePerShare: string;
  allowZapIn: boolean;
  allowZapOut: boolean;
  zapInWith?: string;
  zapOutWith?: string;
  mainPositionKey: LabsPositionsTypes;
  DEPOSIT: PositionView;
  YIELD: PositionView;
  STAKE: PositionView;
  token: TokenView;
}

export interface SummaryData {
  totalDeposits: string;
  totalEarnings: string;
  estYearlyYield: string;
}
