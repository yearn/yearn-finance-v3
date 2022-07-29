import { Address, Event } from './Blockchain';
import { TokenView } from './Token';

export interface BasicCreditLineData {
  id: string;
  status: string;
  borrower: Address;
  principal: string;
}

export interface CreditLine extends BasicCreditLineData {
  id: string;
  status: string;
  borrower: Address;
  oracle: Address;
  spigot: Address;
  escrow: Address;

  principal: string;
  interest: string;
  positions?: CreditPosition[];
  collateral?: Collateral[];
}

export interface CreditPosition {
  lender: Address;
  token: Address;
  principal: string;
  interest: string;
  interestClaimable: string;
  events?: Event[];
}

export interface Collateral {
  token: Address;
  amount: string; // figure out which BigNumber they use
  value: string;
}
