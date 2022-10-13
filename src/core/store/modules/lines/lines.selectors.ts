import { createSelector } from '@reduxjs/toolkit';
import { memoize } from 'lodash';

import {
  RootState,
  Status,
  LineActionsStatusMap,
  AggregatedCreditLine,
  Address,
  CreditLinePage, // prev. GeneralVaultView, Super indepth data, CreditLinePage is most similar atm
} from '@types';
import { toBN, mapStatusToString, formatCreditEvents, formatCollateralEvents } from '@utils';

import { initialLineActionsStatusMap } from './lines.reducer';

/* ---------------------------------- State --------------------------------- */
const selectUserWallet = (state: RootState) => state.wallet.selectedAddress;
const selectLinesState = (state: RootState) => state.lines;
const selectUserLinesPositionsMap = (state: RootState) => state.lines.user.linePositions;
// const selectUserLinesMetadataMap = (state: RootState) => state.lines.user.userLinesMetadataMap;
const selectLinesMap = (state: RootState) => state.lines.linesMap;
const selectLinePagesMap = (state: RootState) => state.lines.pagesMap;
const selectLineCategories = (state: RootState) => state.lines.categories;
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

const selectLiveLines = createSelector([selectLines], (lines): AggregatedCreditLine[] => {
  return lines.filter((line: AggregatedCreditLine) => line.end < Date.now() / 1000);
});

// Not needed yet. TODO: Select all past-term lines
// const selectDeprecatedLines = createSelector([selectLines], (lines): PositionSummary[] => {
//   const deprecatedLines = lines
//     .filter((line) => line.hideIfNoDeposits)
//     .map(({ token, ...rest }) => ({ token, ...rest }));
//   return deprecatedLines.filter((line) => toBN(line.userDeposited).gt(0));
// });

// const selectDepositedLines = createSelector(
//   [selectUserLinesPositionsMap, selectUserWallet],
//   (positions, wallet): UserPositionSummary[] => {
//     return Object.values(positions)
//       .filter((p) => p.lender === wallet)
//       .map((p) => ({
//         ...p,
//         role: LENDER_POSITION_ROLE,
//         available: p.deposit - p.principal,
//         amount: p.deposit,
//       }));
//   }
// );

const selectSelectedLineActionsStatusMap = createSelector(
  [selectLinesActionsStatusMap, selectSelectedLineAddress],
  (linesActionsStatusMap, selectedLineAddress): LineActionsStatusMap => {
    return selectedLineAddress ? linesActionsStatusMap[selectedLineAddress] : initialLineActionsStatusMap;
  }
);

const selectLinesForCategories = createSelector(
  [selectLinesMap, selectLineCategories],
  (linesMap, categories): { [key: string]: AggregatedCreditLine[] } => {
    return Object.entries(categories).reduce(
      (obj: object, [category, lines]: [string, string[]]) => ({
        ...obj,
        [category]: lines.map((l: string): AggregatedCreditLine => linesMap[l]),
      }),
      {}
    );
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

const selectSelectedLinePage = createSelector(
  [selectLinePagesMap, selectSelectedLineAddress],
  (pages, line): CreditLinePage | undefined => {
    return line ? pages[line] : undefined;
  }
);

/* --------------------------------- Helper --------------------------------- */
// interface CreateLineProps {
//   lineData: AggregatedCreditLine;
//   // tokenAllowancesMap: AllowancesMap;
//   positions: { [key: string]: PositionSummary };
//   // userLinesMetadataMap: UserPositionMetadata;
//   lineAllowancesMap: AllowancesMap;
// }
// function createLine(props: CreateLineProps):AggregatedCreditLine{
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

export const LinesSelectors = {
  selectLinesState,
  selectLinesMap,
  selectLines,
  selectLiveLines,
  selectLinesForCategories,
  selectSelectedLinePage,
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
  // selectDepositedLines,
  selectSummaryData,
  selectRecommendations,
  selectLinesStatus,
  selectLine,
  // selectExpectedTxOutcome,
  // selectExpectedTxOutcomeStatus,
  selectUnderlyingTokensAddresses,
};
