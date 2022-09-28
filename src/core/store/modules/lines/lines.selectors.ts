import { createSelector } from '@reduxjs/toolkit';
import { memoize } from 'lodash';

import {
  RootState,
  Status,
  LineActionsStatusMap,
  CreditLine,
  Token,
  Balance,
  AllowancesMap,
  BaseCreditLine,
  GetLinePageResponse,
  UserPositionMetadata,
  Address,
  CreditLinePage, // prev. GeneralVaultView, Super indepth data, CreditLinePage is most similar atm
  PositionSummary,
  UserPositionSummary,
  Spigot,
  CollateralEvent,
  CreditLineEvents,
  ModuleNames,
  SPIGOT_MODULE_NAME,
  ESCROW_MODULE_NAME,
  LENDER_POSITION_ROLE,
  LinePageCreditPosition,
} from '@types';
import { toBN, mapStatusToString, formatCreditEvents, formatCollateralEvents } from '@utils';

import { createToken } from '../tokens/tokens.selectors';

import { initialLineActionsStatusMap } from './lines.reducer';

/* ---------------------------------- State --------------------------------- */
const selectUserWallet = (state: RootState) => state.wallet.selectedAddress;
const selectLinesState = (state: RootState) => state.lines;
const selectUserLinesPositionsMap = (state: RootState) => state.lines.user.linePositions;
// const selectUserLinesMetadataMap = (state: RootState) => state.lines.user.userLinesMetadataMap;
const selectLinesMap = (state: RootState) => state.lines.linesMap;
const selectLinesAddresses = (state: RootState) => Object.keys(state.lines.linesMap);
const selectUserTokensMap = (state: RootState) => state.tokens.user.userTokensMap;
const selectUserTokensAllowancesMap = (state: RootState) => state.tokens.user.userTokensAllowancesMap;
const selectLinesAllowancesMap = (state: RootState) => state.lines.user.lineAllowances;
const selectTokensMap = (state: RootState) => state.tokens.tokensMap;
const selectSelectedLineAddress = (state: RootState) => state.lines.selectedLineAddress;
const selectLinesActionsStatusMap = (state: RootState) => state.lines.statusMap.user.linesActionsStatusMap;
const selectLinesStatusMap = (state: RootState) => state.lines.statusMap;
// const selectExpectedTxOutcome = (state: RootState) => state.lines.transaction.expectedOutcome;
// const selectExpectedTxOutcomeStatus = (state: RootState) => state.lines.statusMap.getExpectedTransactionOutcome;
const selectUserLinesSummary = (state: RootState) => state.lines.user.linePositions;

const selectGetLinesStatus = (state: RootState) => state.lines.statusMap.getLines;
const selectGetUserLinesPositionsStatus = (state: RootState) => state.lines.statusMap.user.getUserLinePositions;

/* ----------------------------- Main Selectors ----------------------------- */
const selectLines = createSelector([selectLinesMap], (linesMap) => {
  return Object.values(linesMap);
});

const selectLiveLines = createSelector([selectLines], (lines): CreditLine[] => {
  return lines.filter((line: CreditLine) => line.end < Date.now() / 1000);
});

// Not needed yet. TODO: Select all past-term lines
// const selectDeprecatedLines = createSelector([selectLines], (lines): PositionSummary[] => {
//   const deprecatedLines = lines
//     .filter((line) => line.hideIfNoDeposits)
//     .map(({ token, ...rest }) => ({ token, ...rest }));
//   return deprecatedLines.filter((line) => toBN(line.userDeposited).gt(0));
// });

const selectDepositedLines = createSelector(
  [selectUserLinesPositionsMap, selectUserWallet],
  (positions, wallet): UserPositionSummary[] => {
    return Object.values(positions)
      .filter((p) => p.lender === wallet)
      .map((p) => ({
        ...p,
        role: LENDER_POSITION_ROLE,
        available: p.deposit - p.principal,
        amount: p.deposit,
      }));
  }
);

const selectSelectedLineActionsStatusMap = createSelector(
  [selectLinesActionsStatusMap, selectSelectedLineAddress],
  (linesActionsStatusMap, selectedLineAddress): LineActionsStatusMap => {
    return selectedLineAddress ? linesActionsStatusMap[selectedLineAddress] : initialLineActionsStatusMap;
  }
);

const selectSummaryData = createSelector([selectUserLinesSummary], (userLinesSummary) => {
  return {
    totalDeposits: userLinesSummary?.holdings ?? '0',
    totalEarnings: userLinesSummary?.earnings ?? '0',
    estYearlyYeild: userLinesSummary?.estimatedYearlyYield ?? '0',
    apy: userLinesSummary?.grossApy.toString() ?? '0',
  };
});

const selectRecommendations = createSelector([selectLiveLines, selectLinesMap], (activeLines, linesMap) => {
  const stableCoinSymbols = ['DAI', 'sUSD'];
  const targetTokenSymbols = ['ETH'];
  const stableLines: CreditLinePage[] = [];
  const tokenLines: CreditLinePage[] = [];
  // stableCoinsSymbols.forEach((symbol) => {
  //   const line = lines.find((line) => line.token.symbol === symbol);
  //   if (!line) return;
  //   stableLines.push(line);
  // });

  // targetTokenSymbols.forEach((symbol) => {
  //   const line = lines.find((line) => line.token.symbol === symbol);
  //   if (!line) return;
  //   tokenLines.push(line);
  // });

  // return [stableLine, derivativeLines[1], derivativeLines[0]].filter((item) => !!item);
  // const sortedLines = [...lines].sort((a, b) => {
  //   return toBN(b.apyData).minus(a.apyData).toNumber();
  // });

  // return object with fields for categories
});

const selectLine = createSelector([selectLinesMap], (linesMap) =>
  memoize((lineAddress: string) => linesMap[lineAddress])
);

const selectUnderlyingTokensAddresses = createSelector([selectUserLinesPositionsMap], (lines): Address[] => {
  return Object.values(lines).map((line) => line.token);
});

/* -------------------------------- Statuses -------------------------------- */
const selectLinesGeneralStatus = createSelector([selectLinesStatusMap], (statusMap): Status => {
  const loading = statusMap.getLines.loading;
  const error = statusMap.getLines.error;
  return { loading, error };
});

const selectSelectedLine = createSelector([selectLines, selectSelectedLineAddress], (lines, selectedLineAddress) => {
  if (!selectedLineAddress) {
    return undefined;
  }
  return lines.find((line) => line.id === selectedLineAddress);
});

const selectLinesStatus = createSelector(
  [selectGetLinesStatus, selectGetUserLinesPositionsStatus],
  (getLinesStatus, getUserLinesPositionsStatus): Status => {
    return {
      loading: getLinesStatus.loading || getUserLinesPositionsStatus.loading,
      error: getLinesStatus.error || getUserLinesPositionsStatus.error,
    };
  }
);

/* --------------------------------- Helper --------------------------------- */
// interface CreateLineProps {
//   lineData: BaseCreditLine;
//   // tokenAllowancesMap: AllowancesMap;
//   positions: { [key: string]: PositionSummary };
//   // userLinesMetadataMap: UserPositionMetadata;
//   lineAllowancesMap: AllowancesMap;
// }
// function createLine(props: CreateLineProps): CreditLine {
//   const {
//     lineData,
//     // tokenAllowancesMap,
//     lineAllowancesMap,
//     positions,
//     // userLinesMetadataMap,
//   } = props;

//   return {
//     ...lineData,
//   };
// }

interface CreateLinePageProps {
  lineData: GetLinePageResponse;
  tokenAllowancesMap: AllowancesMap;
  positions: { [key: string]: PositionSummary };
  // userLinesMetadataMap: UserPositionMetadata;
  lineAllowancesMap: AllowancesMap;
}
function createLinePage(props: CreateLinePageProps): CreditLinePage {
  const {
    tokenAllowancesMap,
    lineData,
    lineAllowancesMap,
    positions,
    // userLinesMetadataMap,
  } = props;
  const lineAddress = lineData.id;
  const currentAllowance = tokenAllowancesMap[lineAddress] ?? '0';

  console.log('get lines category res: ', lineAddress, lineData);
  const { start, end, status, borrower, credits, spigot, escrow } = lineData;

  // derivative or aggregated data we need to compute and store while mapping position data

  // position id and APY
  const highestApy: [string, string, number] = ['', '', 0];
  const activeIds: string[] = [];
  // aggregated revenue in USD by token across all spigots
  const tokenRevenue: { [key: string]: number } = {};
  const principal = 0;
  const interest = 0;
  //  all recent Spigot and Escrow events
  let collateralEvents: CollateralEvent[] = [];
  //  all recent borrow/lend events
  let creditEvents: CreditLineEvents[] = [];

  const formattedCredits = credits?.reduce((obj: any, c: any) => {
    const {
      deposit,
      drawnRate,
      id,
      lender,
      events: graphEvents,
      principal,
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
  const formattedSpigotsData = spigot?.spigots?.reduce((obj: any, s: any): { [key: string]: Spigot } => {
    const {
      id,
      token: { symbol, lastPriceUSD },
      active,
      contract,
      startTime,
      events,
    } = s;
    collateralEvents = [
      ...collateralEvents,
      ...formatCollateralEvents(SPIGOT_MODULE_NAME, symbol, lastPriceUSD, events, tokenRevenue)[1],
    ];
    return { ...obj, [id]: { active, contract, symbol, startTime, lastPriceUSD } };
  }, {});
  const formattedEscrowData = escrow?.deposits?.reduce((obj: any, d: any) => {
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

  const pageData: CreditLinePage = {
    // metadata
    id: lineAddress,
    start,
    end,
    status: mapStatusToString(status),
    borrower,
    // debt data
    principal,
    interest,
    highestApy,
    tokenRevenue,
    activeIds,
    // all recent events
    collateralEvents,
    creditEvents,

    credits: formattedCredits,
    // collateral data
    spigot: !spigot?.active ? undefined : { spigots: formattedSpigotsData },
    escrow: !escrow?.deposits?.length ? undefined : { deposits: formattedEscrowData },
  };

  return pageData;
}

export const LinesSelectors = {
  selectLinesState,
  selectLinesMap,
  selectLines,
  selectLiveLines,
  // selectDeprecatedLines,
  selectUserLinesPositionsMap,
  selectUserTokensMap,
  selectTokensMap,
  selectSelectedLineAddress,
  selectLinesActionsStatusMap,
  selectLinesStatusMap,
  selectLinesGeneralStatus,
  selectSelectedLine,
  selectSelectedLineActionsStatusMap,
  selectDepositedLines,
  selectSummaryData,
  selectRecommendations,
  selectLinesStatus,
  selectLine,
  // selectExpectedTxOutcome,
  // selectExpectedTxOutcomeStatus,
  selectUnderlyingTokensAddresses,
};
