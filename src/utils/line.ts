import { isEmpty } from 'lodash';
import { BigNumber, utils } from 'ethers';

import {
  CreditLinePage,
  RevenueContract,
  AggregatedCreditLine,
  CreditEvent,
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
  GetLinePageAuxDataResponse,
  LinePageCreditFragResponse,
  LineEventFragResponse,
} from '@types';

const { parseUnits, parseEther } = utils;

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
export const formatCreditEvents = (
  symbol: string,
  price: number = 0,
  events: LineEventFragResponse[]
): CreditEvent[] => {
  return events.map((e: any): CreditEvent => {
    const { __typename, amount, token, credit, timestamp, value = unnullify(0, true) } = e;
    return {
      id: credit?.id,
      __typename,
      timestamp,
      amount,
      value,
      token: token?.id,
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

  if (!events) return [totalVal, []];

  // TODO promise.all token price fetching for better performance
  const newEvents: (CollateralEvent | undefined)[] = events?.map((e: any): CollateralEvent | undefined => {
    const { __typename, timestamp, amount, token, value = unnullify(0, true) } = e;
    if (!timestamp || !amount) return undefined;

    const valueNow = unnullify(price.toString(), true).times(unnullify((amount.toString(), true)));

    if (type === SPIGOT_MODULE_NAME) {
      // aggregate token revenue. not needed for escrow bc its already segmented by token
      // use price at time of revenue for more accuracy
      tokenRevenue[symbol] += parseUnits(unnullify(tokenRevenue[symbol], true), 'ether').add(value).toString();
    }
    totalVal += valueNow;
    return {
      type,
      __typename,
      timestamp,
      amount,
      value,
      valueNow,
      id: token?.id,
    };
  });

  const validEvents = newEvents.filter((x) => !!x) as CollateralEvent[];
  return [totalVal, validEvents];
};
/** Formatting functions. from GQL structured response to flat data for redux state  */

export const unnullify = (thing: any, toBN?: boolean) => {
  const x = !thing ? '0' : thing.toString();
  return toBN ? BigNumber.from(x) : x;
};
export function formatGetLinesData(
  response: GetLinesResponse[],
  tokenPrices: { [token: string]: BigNumber }
): AggregatedCreditLine[] {
  return response.map((data: any) => {
    const {
      borrower: { id: borrower },
      positions,
      escrow: { deposits, ...baseEscrow },
      spigot: { summaries: revenues, ...baseSpigot },
      ...rest
    } = data;
    const { credit, spigot, escrow } = formatAggregatedCreditLineData(positions, deposits, revenues, tokenPrices);
    // formatAggData (credits, deposits, summaries);

    return {
      ...rest,
      ...credit,
      positions,
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
  response: GetLinePageAuxDataResponse,
  line: AggregatedCreditLine,
  tokenPrices: { [token: string]: BigNumber }
): GetLinePageAuxDataResponse | undefined {
  const { ...rest } = response;
  // TODO for Line Page
  return;
}

export const formatAggregatedCreditLineData = (
  credits: BaseCreditFragResponse[],
  collaterals: BaseEscrowDepositFragResponse[],
  revenues: SpigotRevenueSummaryFragresponse[],
  tokenPrices: { [token: string]: BigNumber }
): {
  credit: {
    highestApy: [string, string, string];
    principal: string;
    deposit: string;
  };
  spigot: { tokenRevenue: { [key: string]: string } };
  escrow: {
    collateralValue: string;
    cratio: string;
  };
} => {
  // derivative or aggregated data we need to compute and store while mapping position data

  // position id, token address, APY
  const highestApy: [string, string, string] = ['', '', '0'];

  const principal = BigNumber.from(0);
  const deposit = BigNumber.from(0);

  const credit = credits.reduce(
    (agg: any, c) => {
      const price = tokenPrices[c.token?.id] || BigNumber.from(0);
      const highestApy =
        BigNumber.from(c.dRate) > BigNumber.from(agg.highestApy[2]) ? [c.id, c.token?.id, c.dRate] : agg.highestApy;
      return {
        principal: agg.principal.add(price.mul(unnullify(c.principal).toString())),
        deposit: agg.deposit.add(price.mul(unnullify(c.deposit).toString())),
        highestApy,
      };
    },
    { principal, deposit, highestApy }
  );

  const collateralValue = collaterals.reduce((agg, c) => {
    const price = unnullify(tokenPrices[c.token?.id], true);
    return !c.enabled ? agg : agg.add(parseUnits(unnullify(c.amount).toString(), 'ether').mul(price));
  }, BigNumber.from(0));

  const escrow = {
    collateralValue: collateralValue.toString(),
    cratio: parseUnits(unnullify(credit.principal).toString(), 'ether').eq(0)
      ? '0'
      : collateralValue.div(unnullify(credit.principal).toString()).toString(),
  };

  // aggregated revenue in USD by token across all spigots
  const tokenRevenue: { [key: string]: string } = revenues.reduce((ggg, r) => {
    return { ...r, [r.token]: (r.totalVolumeUsd ?? '0').toString() };
  }, {});

  return {
    credit: {
      highestApy: credit.highestApy.map((s: string) => parseUnits(unnullify(s), 'ether').toString()),
      principal: parseUnits(unnullify(credit.principal), 'ether').toString(),
      deposit: parseUnits(unnullify(credit.deposit), 'ether').toString(),
    },
    escrow,
    spigot: { tokenRevenue },
  };
};

export const formatLinePageData = (lineData: GetLinePageResponse): CreditLinePage => {
  const {
    spigot,
    escrow,
    positions,
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
  const tokenRevenue: { [key: string]: string } = {};
  const principal = BigNumber.from(0);
  const deposit = BigNumber.from(0);
  const interest = BigNumber.from(0);
  const totalInterestRepaid = BigNumber.from(0);
  //  all recent Spigot and Escrow events
  let collateralEvents: CollateralEvent[] = [];
  //  all recent borrow/lend events
  let creditEvents: CreditEvent[] = [];

  const formattedPositions = positions?.reduce((obj: any, c: LinePageCreditFragResponse) => {
    const {
      dRate,
      fRate,
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
    const events = graphEvents ? formatCreditEvents(c.token.symbol, currentPrice, graphEvents!) : [];
    creditEvents.concat(events);
    return {
      ...obj,
      [id]: {
        id,
        lender: lender.id,
        deposit,
        dRate,
        fRate,
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
    principal: principal.toString(),
    deposit: deposit.toString(),
    interest: interest.toString(),
    totalInterestRepaid: totalInterestRepaid.toString(),
    highestApy: highestApy.map((s) => s.toString()) as [string, string, string],
    // all recent events
    collateralEvents,
    creditEvents,

    positions: formattedPositions,
    // collateral data
    spigot: spigotData,
    escrow: isEmpty(escrow?.deposits) ? undefined : { ...escrow!, deposits: formattedEscrowData },
  };

  return pageData;
};
