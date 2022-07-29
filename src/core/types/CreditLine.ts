import { Address, Event } from './Blockchain';
import { TokenView } from './Token';

export interface BasicCreditLineData {
  id: string;
  creditLineStatus: number;
  borrower: Address;
  principal: number;
}

export interface CreditLine extends BasicCreditLineData {
  id: string;
  creditLineStatus: number;
  borrower: Address;
  oracle: Address;
  spigot: Address;
  escrow: Address;

  principal: number;
  interest: number;
  positions?: CreditPosition[];
  collateral?: Collateral[];
}

export interface CreditPosition {
  lender: Address;
  token: Address;
  principal: number;
  interest: number;
  interestClaimable: number;
  events?: Event[];
}

export interface Collateral {
  token: Address;
  amount: number; // figure out which BigNumber they use
  value: number;
}
