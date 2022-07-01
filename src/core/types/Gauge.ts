import { Address } from './Blockchain';
import { TokenView } from './Token';
import { PositionView } from './Position';

export interface GaugeView {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  balanceUsdc: string;
  boost: number;
  token: TokenView;
  DEPOSIT: PositionView;
  YIELD: PositionView;
}
