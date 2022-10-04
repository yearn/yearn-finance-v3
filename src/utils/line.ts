import { isEmpty } from 'lodash';
import { BigNumber } from 'ethers';

import {
  GetLinePageResponse,
  CreditLinePage,
  RevenueContract,
  AggregatedCreditLine,
  Spigot,
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
    const { id, __typename, amount, timestamp, value } = e;
    return {
      id,
      __typename,
      timestamp,
      symbol: symbol || 'UNKNOWN',
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
    const { __typename, timestamp, amount, value } = e;
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
      symbol: symbol || 'UNKNOWN',
    };
  });
  return [totalVal, newEvents];
};
/** Formatting functions. from GQL structured response to flat data for redux state  */

export function formatGetLinesData(response: any[]): AggregatedCreditLine[] {
  return response.map((data: any) => {
    const {
      borrower: { id: borrower },
      status,
      // escrow: { id: escrow },
      // spigot: { id: spigot },
      biggestCredit,
      biggestDebt,
      ...rest
    } = data;

    return {
      ...rest,
      principal: 0, //  getCurrentValue(biggestDebt.token.symbol, biggestDebt.principal),
      deposit: 0, // getCurrentValue(biggestCredit.token.symbol,  biggestCredit.deposit),
      status: mapStatusToString(status),
      borrower,
    };
  });
}

export const formatLinePageData = (lineData: GetLinePageResponse): CreditLinePage => {
  const {
    spigot,
    escrow,
    credits,
    status,
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
        active,
        contract,
        startTime,
        ownerSplit,
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
    // todo add UsePositionMetada,
    status: mapStatusToString(status),
    // debt data
    principal,
    deposit,
    interest,
    totalInterestRepaid,
    highestApy,
    activeIds,
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
