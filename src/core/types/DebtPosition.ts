import { Address } from './Blockchain';

export interface DebtPosition {
  id: string;
  contract: Address;
  token: Address;
  lender: Address;
  borrower: Address;
  // 0 indexed position in repayment queue
  // only has value if drawndown
  queue: number;

  deposit: number;
  principal: number;
  principalUsd: number;
  interestAccrued: number;
  interestUsd: number;
  interestRepaid: number;
  totalInterestEarned: number; // lifetime gross revenue of lender on position

  // interest in bps charged on principal
  drawnRate: number;
  // interest in bps charged on deposit less principal
  facilityRate: number;
}
