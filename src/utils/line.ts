import { isEmpty } from 'lodash';
import { BigNumber } from 'ethers';

import {
  CreditLinePage,
  RevenueContract,
  AggregatedCreditLine,
  CreditLineEvents,
  CollateralEvent,
  ModuleNames,
  ESCROW_MODULE_NAME,
  SPIGOT_MODULE_NAME,
  LineStatusTypes,
  UNINITIALIZED_STATUS,
  ACTIVE_STATUS,
  LIQUIDATABLE_STATUS,
  REPAID_STATUS,
  INSOLVENT_STATUS,
  NO_STATUS,
  GetLinePageResponse,
  GetLinesResponse,
  BaseCreditFragResponse,
  BaseEscrowDepositFragResponse,
  SpigotRevenueSummaryFragresponse,
  Address,
  GetLinePageAuxResponse,
} from '@types';

export const mapStatusToString = (status: number): LineStatusTypes => {
  switch (status) {
    case 0:
      return UNINITIALIZED_STATUS;
    case 2:
      return ACTIVE_STATUS;
    case 3:
      return LIQUIDATABLE_STATUS;
    case 4:
      return REPAID_STATUS;
    case 5:
      return INSOLVENT_STATUS;
    default:
      return NO_STATUS;
  }
};

/**
 * @function
 * @name mergeCollateralEvents
 * @desc - takes all events for a single deposit/spigot and merges them into global list
 * @dev  - expects all events to be in the same token
 * @param type - the type of module used as collateral
 * @param symbol - the token in event
 * @param price - the price to use for events. Generally current price for escrow and time of event for spigot
 * @param events - the events to process
 */
export const formatCreditEvents = (symbol: string, price: number = 0, events: CreditLineEvents[]) => {
  return events.map((e: any): CreditLineEvents => {
    const { id, __typename, amount, token, timestamp, value } = e;
    return {
      id,
      __typename,
      timestamp,
      token: token.id,
      amount,
      value,
      currentValue: price * value,
    };
  });
};

/**
 * @function
 * @name mergeCollateralEvents
 * @desc - takes all events for a single deposit/spigot and merges them into global list
 * @dev  - expects all events to be in the same token
 * @param type - the type of module used as collateral
 * @param symbol - the token in event
 * @param price - current price for escrow and spigot collateral
 * @param events - the events to process
 * @return totalVal, CollateralEvent[] - current total value of all collateral
 */
export const formatCollateralEvents = (
  type: ModuleNames,
  symbol: string,
  price: number = 0,
  events: CollateralEvent[],
  tokenRevenue?: any
): [number, CollateralEvent[]] => {
  let totalVal = 0;
  // TODO promise.all token price fetching for better performance
  const newEvents: CollateralEvent[] = events.map((e: any): CollateralEvent => {
    const { __typename, timestamp, amount, token, value } = e;
    const valueNow = price * amount;
    if (type === SPIGOT_MODULE_NAME) {
      // aggregate token revenue. not needed for escrow bc its already segmented by token
      // use price at time of revenue for more accuracy
      tokenRevenue[symbol] += value;
    }
    totalVal += valueNow;
    return {
      type,
      __typename,
      timestamp,
      amount,
      value,
      valueNow,
      id: token.id,
    };
  });
  return [totalVal, newEvents];
};
/** Formatting functions. from GQL structured response to flat data for redux state  */

export function formatGetLinesData(
  response: GetLinesResponse[],
  tokenPrices: { [token: string]: BigNumber }
): AggregatedCreditLine[] {
  return response.map((data: any) => {
    const {
      borrower: { id: borrower },
      credits,
      escrow: { deposits, ...baseEscrow },
      spigot: { summaries: revenues, ...baseSpigot },
      ...rest
    } = data;
    const { credit, spigot, escrow } = formatAggregatedCreditLineData(credits, deposits, revenues, tokenPrices);

    // formatAggData (credits, deposits, summaries);

    return {
      ...rest,
      ...credit,
      borrower,
      spigot: {
        ...baseSpigot,
        ...spigot,
      },
      escrow: {
        ...baseEscrow,
        ...escrow,
      },
    };
  });
}

export function formatGetLinePageAuxData(
  response: GetLinePageAuxResponse,
  line: AggregatedCreditLine,
  tokenPrices: { [token: string]: BigNumber }
): CreditLinePage | undefined {
  const { ...rest } = response;

  return;
}

export const formatAggregatedCreditLineData = (
  credits: BaseCreditFragResponse[],
  collaterals: BaseEscrowDepositFragResponse[],
  revenues: SpigotRevenueSummaryFragresponse[],
  tokenPrices: { [token: string]: BigNumber }
): {
  credit: {
    highestApy: [string, string, BigNumber];
    principal: BigNumber;
    deposit: BigNumber;
  };
  spigot: { tokenRevenue: { [key: string]: BigNumber } };
  escrow: {
    collateralValue: BigNumber;
    cratio: BigNumber;
  };
} => {
  // derivative or aggregated data we need to compute and store while mapping position data

  // position id, token address, APY
  const highestApy: [string, string, BigNumber] = ['', '', BigNumber.from(0)];

  const principal = BigNumber.from(0);
  const deposit = BigNumber.from(0);

  const credit = credits.reduce(
    (agg: any, c) => {
      const price = tokenPrices[c.token.id] || BigNumber.from(0);
      const highestApy = c.drate > agg.highestApy[2] ? [c.id, c.token.id, c.drate] : agg.highestApy;
      return {
        principal: agg.principal.add(price.mul(c.principal)),
        deposit: agg.deposit.add(price.mul(c.deposit)),
        highestApy,
      };
    },
    { principal, deposit, highestApy }
  );

  const collateralValue = collaterals.reduce((agg, c) => {
    const price = tokenPrices[c.token.id];
    return !c.enabled ? agg : agg.add(c.amount.mul(price));
  }, BigNumber.from(0));

  const escrow = {
    collateralValue,
    cratio: credit.principal.eq(0) ? BigNumber.from(0) : collateralValue.div(credit.principal),
  };

  // aggregated revenue in USD by token across all spigots
  const tokenRevenue: { [key: string]: BigNumber } = revenues.reduce((ggg, r) => {
    return { ...r, [r.token]: r.totalVolumeUsd };
  }, {});

  return {
    credit,
    escrow,
    spigot: { tokenRevenue },
  };
};

// TODO rename formatAggregatedCreditLineData and use in CreditService.getLines() + .getLinePage()
export const formatLinePageData = (lineData: GetLinePageResponse): CreditLinePage => {
  const {
    spigot,
    escrow,
    credits,
    borrower: { id: borrower },
    ...metadata
    // userLinesMetadataMap,
  } = lineData;
  const lineAddress = lineData.id;

  console.log('get lines category res: ', lineAddress, lineData);

  // derivative or aggregated data we need to compute and store while mapping position data

  // position id and APY
  const highestApy: [string, string, BigNumber] = ['', '', BigNumber.from(0)];
  const activeIds: string[] = [];
  // aggregated revenue in USD by token across all spigots
  const tokenRevenue: { [key: string]: BigNumber } = {};
  const principal = BigNumber.from(0);
  const deposit = BigNumber.from(0);
  const interest = BigNumber.from(0);
  const totalInterestRepaid = BigNumber.from(0);
  //  all recent Spigot and Escrow events
  let collateralEvents: CollateralEvent[] = [];
  //  all recent borrow/lend events
  let creditEvents: CreditLineEvents[] = [];

  const formattedCredits = credits?.reduce((obj: any, c: any) => {
    const {
      drawnRate,
      id,
      lender,
      events: graphEvents,
      principal,
      deposit,
      interestAccrued,
      interestRepaid,
      token,
    } = c;
    activeIds.push(id);
    // const currentPrice = await fetchTokenPrice(symbol, Date.now())
    const currentPrice = 1e8;
    const events = formatCreditEvents(c.token.symbol, currentPrice, graphEvents);
    creditEvents.concat(events);
    return {
      ...obj,
      [id]: {
        id,
        lender,
        deposit,
        drawnRate,
        principal,
        interestAccrued,
        interestRepaid,
        token: { symbol: token.symbol, lastPriceUSD: currentPrice },
        events,
      },
    };
  }, {});
  const formattedSpigotsData = Object.values(spigot?.spigots ?? {}).reduce(
    (obj: any, s: any): { [key: string]: RevenueContract } => {
      const {
        id,
        token: { symbol, lastPriceUSD },
        events,
      } = s;
      collateralEvents = [
        ...collateralEvents,
        ...formatCollateralEvents(SPIGOT_MODULE_NAME, symbol, lastPriceUSD, events, tokenRevenue)[1],
      ];
      return { ...obj, [id]: s };
    },
    {}
  );
  const formattedEscrowData = Object.values(escrow?.deposits ?? {}).reduce((obj: any, d: any) => {
    const {
      id,
      amount,
      enabled,
      token: { symbol },
      events,
    } = d;
    // TODO promise.all token price fetching for better performance
    // const currentUsdPrice = await fetchTokenPrice(symbol, Datre.now());
    const currentUsdPrice = 1e8;
    formatCollateralEvents(ESCROW_MODULE_NAME, symbol, currentUsdPrice, events); // normalize and save events
    return { ...obj, [id]: { symbol, currentUsdPrice, amount, enabled } };
  }, {});

  const spigotData = isEmpty(spigot?.spigots)
    ? undefined
    : {
        ...spigot!,
        tokenRevenue,
        spigots: formattedSpigotsData,
      };

  const pageData: CreditLinePage = {
    // metadata
    ...metadata,
    borrower,
    // todo add UsePositionMetada,
    // debt data
    principal,
    deposit,
    interest,
    totalInterestRepaid,
    highestApy,
    // all recent events
    collateralEvents,
    creditEvents,

    credits: formattedCredits,
    // collateral data
    spigot: spigotData,
    escrow: isEmpty(escrow?.deposits) ? undefined : { ...escrow!, deposits: formattedEscrowData },
  };

  return pageData;
};
