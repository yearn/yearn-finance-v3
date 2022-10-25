import { LineStatusTypes, AggregatedCreditLine, CreditLinePage } from '@types';

import { Address } from './Blockchain';

export interface QueryCreator<ArgType, ResponseType> {
  (args: ArgType): QueryResponse<ResponseType>;
}

export interface QueryResponse<ResponseType> extends Promise<ResponseType> {
  loading: boolean;
  error?: string | object;
  data?: ResponseType | undefined;

  // make backwards compatible with Apollos response type
  [key: string]: any;
}

/**
 * @typedef {object} Query
 * @property {string} Query.query - GraohQL query to send
 * @property {object} Query.variables - params to input into query
 */
export interface Query {
  query: string;
  variables?: QueryArgOption;
}

export type QueryArgOption = GetLineArgs | GetLinePageArgs | GetLinesArgs | undefined;

// query props and return vals

/**
 * @typedef {object} GetLineArgs
 * @property {Address} GetLineArgs.id - address of line contract
 */
export interface GetLineArgs {
  id: Address;
}

/**
 * @typedef {object} GetLinePageArgs
 * @property {Address} GetLinePageArgs.id - address of line contract
 */
export interface GetLinePageArgs {
  id: Address;
}

export interface GetLinePageAuxArgs {
  id: Address;
}

/**
 * @typedef {object} GetLinesArgs
 * @property {number} GetLinesArgs.first - how many lines to get
 * @property {string} GetLinesArgs.orderBy - which property to sort on
 * @property {string} GetLinesArgs.orderDirection - if order is ascending or descending
 */
export interface GetLinesArgs {
  first: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}

/**
 * @typedef {object} GetUserLinePositionsArgs
 * @property {Address} GetUserLinePositionsArgs.id - address to look up credit.debit positions for
 */
export interface GetUserLinePositionsArgs {
  id: Address;
}

// React hook args wrapping these queries
export interface UseCreditLinesParams {
  [key: string]: GetLinesArgs;
}

export interface UseCreditLineParams {
  id: Address;
}

/*
  Query Responses Types
*/
type QueryResponseTypes = AggregatedCreditLine | AggregatedCreditLine[] | CreditLinePage;

export interface BaseLineFragResponse {
  id: Address;
  end: number;
  type: string;
  start: number;
  status: LineStatusTypes;
  borrower: {
    id: Address;
  };
}

export interface BaseCreditFragResponse {
  id: Address;
  principal: string;
  deposit: string;
  drate: string;
  arbiter: string;
  token: {
    id: Address;
    symbol: string;
    decimals: number;
  };
}

export interface LinePageCreditFragResponse extends BaseCreditFragResponse {
  interestRepaid: string;
  interestAccrued: string;
  dRate: string;
  fRate: string;

  lender: {
    id: string;
  };

  events?: LineEventFragResponse[];
}

export interface LineEventFragResponse {
  __typename: string;
  id: string;
  timestamp: number;
  credit: {
    id: string;
  };
  // events with value
  value?: string;
  amount?: string;
  // events with rates
  dRate?: string;
  fRate?: string;

  token: {
    id: Address;
  };
}

export interface SpigotRevenueSummaryFragresponse {
  token: Address;
  totalVolumeUsd: string;
  timeOfFirstIncome: number;
  timeOfLastIncome: number;
}

export interface SpigotEventFragResponse {
  __typename: 'ClaimRevenueEvent';
  timestamp: number;
  revenueToken: {
    id: Address;
  };
  escrowed: string;
  netIncome: string;
  value: string;
}

export interface BaseEscrowDepositFragResponse {
  enabled: boolean;
  amount: string;
  token: {
    id: Address;
    symbol: string;
    decimals: number;
  };
}

export interface BaseEscrowFragResponse {
  id: Address;
  minCRatio: string;
  deposits: BaseEscrowDepositFragResponse[];
}

export interface GetLinesResponse {
  lines: BaseLineFragResponse & {
    credits: BaseCreditFragResponse;
    escrow: BaseEscrowFragResponse;
    spigot: {
      id: Address;
      summaries: {
        totalVolumeUsd: string;
        timeOfFirstIncome: number;
        timeOfLastIncome: number;
      };
    };
  };
}

export interface GetLinePageAuxDataResponse {
  events?: LineEventFragResponse[];
  spigot?: {
    events: SpigotEventFragResponse[];
  };
}

export interface GetLinePageResponse extends BaseLineFragResponse {
  positions?: LinePageCreditFragResponse[];

  escrow?: {
    id: Address;
    cratio: string;
    minCRatio: string;
    collateralValue: string;
    deposits: {
      id: Address;
      token: {
        id: Address;
        symbol: string;
        decimals: number;
      };
      amount: string;
      enabled: boolean;
      events: {
        __typename: string;
        timestamp: number;
        // only on add/remove collateral
        amount?: string;
        value?: string;
      };
    };
  };
  spigot?: {
    id: Address;
    spigots: {
      contract: Address;
      active: boolean;
      startTime: number;
    };
    events?: SpigotEventFragResponse[];
  };
}
