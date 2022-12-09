import { Address } from './Blockchain';
import { TokenView } from './Token';
import { PositionView } from './Position';

export interface VotingEscrowView {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  balanceUsdc: string;
  unlockDate?: Date;
  earlyExitPenaltyRatio?: number;
  token: TokenView;
  DEPOSIT: PositionView;
}
