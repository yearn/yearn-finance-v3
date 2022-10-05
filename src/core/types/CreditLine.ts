import { BigNumber } from 'ethers';

import { Address } from './Blockchain';
import { Status } from './Status';

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

export interface BaseCreditLine {
  id: Address;
  type?: string;
  status: LineStatusTypes;
  borrower: Address;

  principal?: number;
  activeIds: string[]; // ids for all open positions
}

export interface CreditLine extends BaseCreditLine {
  // TODO: beef up this type so it has everything we need for homepage cards
  // TODO: replace BaseCreditLine with CreditLine in State.CreditLine and actinos/selectors
  id: Address;
  end: number;
  start: number;
  type?: string;
  status: LineStatusTypes;
  borrower: Address;

  principal?: number;
  activeIds: string[];

  escrow?: { id: Address };
  spigot?: { id: Address };
}

export interface CreditLinePage extends BaseCreditLine {
  id: Address;
  end: number;
  start: number;
  type?: string;
  status: LineStatusTypes;
  borrower: Address;

  // real-time aggregate usd value across all credits
  principal?: number;
  interest?: number;
  // id, symbol, APY (4 decimals
  highestApy: [string, string, number];
  // aggregated revenue in USD by token across all spigots
  tokenRevenue: { [key: string]: number };

  // subgraph id -> depsoit/spigot
  activeIds: string[];
  credits?: { [key: string]: LinePageCreditPosition };
  escrow?: { [key: string]: Escrow };
  spigot?: {
    spigots?: { [key: string]: Spigot };
  };

  collateralEvents: CollateralEvent[];
  creditEvents: CreditLineEvents[];
}

// TODO consolidate Credit and BaseCreditPosition and resolve type conflicts across codebase
export interface BaseCreditPosition {
  id: string;
  lender: Address;
  principal: number;
  interestAccrued: number;
  interestRepaid: number;
  events?: CreditLineEvents[];
}
export interface Credit {
  deposit: BigNumber;
  principal: BigNumber;
  interestAccrued: BigNumber;
  interestRepaid: BigNumber;
  decimals: BigNumber;
  token: Address;
  lender: Address;
}

export interface LinePageCreditPosition extends BaseCreditPosition {
  id: string;
  lender: Address;
  deposit: number;
  principal: number;
  interestAccrued: number;
  interestRepaid: number;
  drawnRate: number;
  token: {
    symbol: string;
    lastPriceUSD?: number; // Can be live data or from subgraph
  };
}

// bare minimum to display about a user on a position

type LenderRole = 'lender';
export const LENDER_POSITION_ROLE: LenderRole = 'lender';
type BorrowerRole = 'borrower';
export const BORROWER_POSITION_ROLE: BorrowerRole = 'borrower';
type ArbiterRole = 'arbiter';
export const ARBITER_POSITION_ROLE: ArbiterRole = 'arbiter';
type PositionRole = LenderRole | BorrowerRole | ArbiterRole;

export interface UserPositionMetadata {
  role: PositionRole;
  amount: number; // principal/deposit
  available: number; // borrowerable/withdrawable
}

export interface PositionSummary {
  id: string;
  borrower: Address;
  lender: Address;
  token: Address;
  line: Address;
  deposit: number;
  principal: number;
  drate: number;
  frate: number;
}

export interface UserPositionSummary extends PositionSummary, UserPositionMetadata {
  id: string;
  borrower: Address;
  lender: Address;
  line: Address;
  token: Address;
  drate: number;
  frate: number;
  // if connected wallet is lender/borrower
  role: PositionRole;
  amount: number; // principal/deposit
  available: number; // borrowerable/withdrawable
}

// Collateral Module Types
export interface Collateral {
  token: Address;
  amount: number;
  value: number;
}

export interface BaseEscrow {
  id: Address;
  cratio: number;
  minCRatio: number;
  collateralValue: number;
}

export interface Escrow extends BaseEscrow {
  id: Address;
  cratio: number;
  minCRatio: number;
  collateralValue: number;
  deposits?: {
    amount: number;
    enabled: boolean;
    token: BaseToken;
  }[];
  events?: {
    __typename: string;
    timestamp: number;
    amount?: number;
    value?: number;
  }[];
}

export interface Spigot {
  startTime: string;
  active: boolean;
  token: BaseToken;
  spigots?: RevenueContract[];
}

export interface LinePageSpigot {
  startTime: string;
  active: boolean;
  // aggregate token revenue accross all spigots
  spigots?: RevenueContract[];
}

export interface RevenueContract {
  active: boolean;
  contract: Address;
  startTime: number;
  ownerSplit: number;
  token: BaseToken;

  events?: SpigotEvents[];
}

export interface BaseToken {
  id: Address;
  name: string;
  symbol: string;
  decimals: number;
  lastPriceUSD?: number;
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
  symbol: string;
  value?: number;
  valueNow?: number;
  [key: string]: any;
}

// Credit Events
export interface CreditEvent extends EventWithValue {
  __typename: string;
  id: string; // position id
  timestamp: number;
  amount: number;
  symbol: string;
  valueAtTime?: number;
  valueNow?: number;
}

export interface SetRateEvent {
  __typename: string;
  id: string; // position id
  timestamp: number;
  drawnRate: number;
  facilityRate: number;
}

export type CreditLineEvents = CreditEvent | SetRateEvent;

// Collateral Events
export interface CollateralEvent extends EventWithValue {
  type: ModuleNames;
  timestamp: number;
  amount: number;
  symbol: string;
  value?: number;
}

// Spigot Events
type SpigotEvents = EventWithValue | ClaimRevenueEvent;

export interface ClaimRevenueEvent {
  timestamp: number;
  revenueToken: { id: string };
  escrowed: number;
  netIncome: number;
  value: number;
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
