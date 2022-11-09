import { Address } from './Blockchain';
import { Status } from './Status';
import { TokenView } from './Token';

type UninitializedStatus = 'uninitialized';
export const UNINITIALIZED_STATUS: UninitializedStatus = 'uninitialized';
type ActiveStatus = 'active';
export const ACTIVE_STATUS: ActiveStatus = 'active';
type LiquidatableStatus = 'liquidatable';
export const LIQUIDATABLE_STATUS: LiquidatableStatus = 'liquidatable';
type RepaidStatus = 'repaid';
export const REPAID_STATUS: RepaidStatus = 'repaid';
type InsolventStatus = 'insolvent';
export const INSOLVENT_STATUS: InsolventStatus = 'insolvent';
type NoStatus = 'no status';
export const NO_STATUS: NoStatus = 'no status';

export type LineStatusTypes =
  | UninitializedStatus
  | ActiveStatus
  | LiquidatableStatus
  | RepaidStatus
  | InsolventStatus
  | NoStatus;

// Individual lender positoin status types
type ProposedStatus = 'PROPOSED';
export const PROPOSED_STATUS: ProposedStatus = 'PROPOSED';
type OpenedStatus = 'OPENED';
export const OPENED_STATUS: OpenedStatus = 'OPENED';
type ClosedStatus = 'CLOSED';
export const CLOSED_STATUS: ClosedStatus = 'CLOSED';

export type PositionStatusTypes = ProposedStatus | OpenedStatus | ClosedStatus;

export interface BaseCreditLine {
  id: Address;
  type?: string;
  start: number;
  end: number;
  status: LineStatusTypes;
  borrower: Address;
  arbiter: Address;
  positions?: [];
  escrow?: { id: Address };
  spigot?: { id: Address };
}

export interface AggregatedCreditLine extends BaseCreditLine {
  // real-time aggregate usd value across all credits
  principal: string; // | Promise<string>;
  deposit: string; // | Promise<string>;
  // id, symbol, APY (4 decimals)
  highestApy: [string, string, string];

  positions?: [];

  escrow?: AggregatedEscrow;
  spigot?: AggregatedSpigot;
}

export interface CreditLinePage extends AggregatedCreditLine {
  // total value of asssets repaid *AT TIME OF REPAYMENT*
  interest: string; // | Promise<string>;
  totalInterestRepaid: string; // | Promise<string>;

  positions?: [];

  collateralEvents: CollateralEvent[];
  creditEvents: CreditEvent[];
}

// data that isnt included in AggregatedCreditLine that we need to fetch for full CreditLinePage dattype
// gets merged into existing AggregatedCredit to form LinePageData
export interface CreditLinePageAuxData {
  positions: {
    [id: string]: {
      dRate: string;
      token: Address;
    };
  }[];
  collateralEvents: CollateralEvent[];
  creditEvents: CreditEvent[];
}

export interface Credit {
  status: PositionStatusTypes;
  deposit: string;
  principal: string;
  interestAccrued: string;
  interestRepaid: string;
  decimals: string;
  arbiter: Address;
  token: TokenView;
  lender: Address;
}

export interface LinePageCreditPosition extends Credit {
  id: string;
  status: PositionStatusTypes;
  lender: Address;
  arbiter: string;
  deposit: string;
  principal: string;
  interestAccrued: string;
  interestRepaid: string;
  totalInterestRepaid: string;
  dRate: string;
  token: TokenView;
  // events?: CreditEvent[];
}

// bare minimum to display about a user on a position

type LenderRole = 'lender';
export const LENDER_POSITION_ROLE: LenderRole = 'lender';
type BorrowerRole = 'borrower';
export const BORROWER_POSITION_ROLE: BorrowerRole = 'borrower';
type ArbiterRole = 'arbiter';
export const ARBITER_POSITION_ROLE: ArbiterRole = 'arbiter';
type PositionRole = LenderRole | BorrowerRole | ArbiterRole;

type CollateralTypeAsset = 'asset';
export const COLLATERAL_TYPE_ASSET: CollateralTypeAsset = 'asset';
type CollateralTypeRevenue = 'revenue';
export const COLLATERAL_TYPE_REVENUE: CollateralTypeRevenue = 'revenue';

type CollateralTypes = CollateralTypeAsset | CollateralTypeRevenue | undefined;

export interface UserPositionMetadata {
  role: PositionRole; // borrower/lender/arbiter
  amount: string; // principal/deposit/collateral
  available: string; // borrowable/withdrawable/liquidatable
}

// TODO consolidate PositonInt and PositionSummary types
export interface PositionInt {
  drate: string;
  frate: string;
  id: string;
  interestAccrued: string;
  interestRepaid: string;
  lender: string;
  deposit: string;
  principal: string;
  status: string;
  tokenAddress: string;
}
export interface PositionSummary {
  id: string;
  borrower: Address;
  lender: Address;
  token: TokenView;
  line: Address;
  deposit: string;
  principal: string;
  drate: string;
  frate: string;
}

export interface UserPositionSummary extends PositionSummary, UserPositionMetadata {}

// Collateral Module Types
export interface Collateral {
  type: CollateralTypes;
  token: TokenView;
  amount: string;
  value: string;
}

export interface BaseEscrow {
  id: Address;
  cratio: string;
  minCRatio: string;
  collateralValue: string;
}

export interface EscrowDeposit extends Collateral {
  type: CollateralTypeAsset;
  token: TokenView;
  amount: string;
  value: string;
  enabled: boolean;

  displayIcon?: string; // url to token icon
}

export interface EscrowDepositList {
  [token: string]: EscrowDeposit;
}

export interface AggregatedEscrow extends BaseEscrow {
  id: Address;
  cratio: string;
  minCRatio: string;
  collateralValue: string;
  deposits?: EscrowDepositList;
}

export interface RevenueSummary extends Collateral {
  type: CollateralTypeRevenue;
  token: TokenView;
  amount: string;
  value: string;
  firstRevenueTimestamp: number;
  lastRevenueTimestamp: number;
}
export interface AggregatedSpigot {
  id: Address;
  // aggregated revenue in USD by token across all spigots
  tokenRevenue: { [key: string]: string }; // TODO: RevenueSummary
}

export interface LinePageSpigot extends AggregatedSpigot {
  spigots?: { [address: string]: RevenueContract };
}

export interface RevenueContract {
  active: boolean;
  contract: Address;
  startTime: number;
  ownerSplit: number;
  token: TokenView;

  events?: SpigotEvents[];
}

type SPIGOT_NAME = 'spigot';
export const SPIGOT_MODULE_NAME: SPIGOT_NAME = 'spigot';
type ESCROW_NAME = 'escrow';
export const ESCROW_MODULE_NAME: ESCROW_NAME = 'escrow';
type CREDIT_NAME = 'credit';
export const CREDIT_MODULE_NAME: CREDIT_NAME = 'credit';

export type ModuleNames = SPIGOT_NAME | CREDIT_NAME | ESCROW_NAME;

//  Events Types

// Common

/**
 *
 *
 * @export
 * @typedef {Object} EventWithValue
 * @interface EventWithValue
 * @property timestamp - unix (seconds) time that event happened at
 * @property value     - value of total amount at time of event
 * @property valueNow  - value of total amount of tokens at present time
 */
export interface EventWithValue {
  __typename?: string;
  timestamp: number;
  amount?: number;
  value?: number;
  valueNow?: number;
  [key: string]: any;
}

// Credit Events
export interface CreditEvent extends EventWithValue {
  __typename: string;
  id: string; // position id
  token?: string;
  timestamp: number;
  amount: number;
  valueAtTime?: number;
  valueNow?: number;
}

export interface SetRateEvent {
  __typename: string;
  id: string; // position id
  timestamp: number;
  dRate: number;
  fRate: number;
}

// Collateral Events
export interface CollateralEvent extends EventWithValue {
  type: CollateralTypes;
  id: Address; // token earned as revenue or used as collateral
  timestamp: number;
  amount: number;
  value?: number;
}

// Spigot Events
type SpigotEvents = ClaimRevenueEvent;

export interface ClaimRevenueEvent extends CollateralEvent {
  revenueToken: TokenView;
  escrowed: number;
  netIncome: number;
}

// Redux State
export interface LineActionsStatusMap {
  get: Status;
  approve: Status;
  deposit: Status;
  withdraw: Status;
}

export interface UserLineMetadataStatusMap {
  getUserLinePositions: Status;
  linesActionsStatusMap: { [lineAddress: string]: LineActionsStatusMap };
}

// Transaction data

export interface DeploySecuredLineTxData {
  oracle: Address;
  arbiter: Address;
  factoryAddress: Address;
  swapTarget: Address;
  borrower: Address;
  ttl: number;
}
