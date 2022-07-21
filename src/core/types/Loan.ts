import { Address, Event } from './Blockchain';
import { TokenView } from './Token';

export interface BasicLoan {
  id: string;
  loanStatus: number;
  borrower: Address;
  principal: number;
}

export interface Loan extends BasicLoan {
  id: string;
  loanStatus: number;
  borrower: Address;
  oracle: Address;
  spigot: Address;
  escrow: Address;

  principal: number;
  interest: number;
  positions?: DebtPosition[];
  collateral?: Collateral[];
}

export interface DebtPosition {
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
