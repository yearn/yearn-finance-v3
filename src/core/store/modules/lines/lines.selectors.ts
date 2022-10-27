import { createSelector } from '@reduxjs/toolkit';
import { memoize, find } from 'lodash';
import { getAddress } from '@ethersproject/address';

import {
  RootState,
  Status,
  LineActionsStatusMap,
  AggregatedCreditLine,
  Address,
  CreditLinePage,
  UserPositionMetadata,
  BORROWER_POSITION_ROLE,
  LENDER_POSITION_ROLE,
  ARBITER_POSITION_ROLE, // prev. GeneralVaultView, Super indepth data, CreditLinePage is most similar atm
} from '@types';
import { toBN, formatCreditEvents, formatCollateralEvents, unnullify } from '@utils';
import { getConstants } from '@src/config/constants';

import { initialLineActionsStatusMap } from './lines.reducer';

const { ZERO_ADDRESS } = getConstants();

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
const selectSelectedPosition = (state: RootState) => state.lines.selectedPosition;

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

const selectUserPositionMetadata = createSelector(
  [selectUserWallet, selectSelectedLine, selectSelectedPosition],
  (userAddress, line, selectedPosition): UserPositionMetadata => {
    const defaultRole = {
      role: LENDER_POSITION_ROLE,
      amount: '0',
      available: '0',
    };

    if (!line || !userAddress) return defaultRole;

    const position = selectedPosition ? line!.positions?.[selectedPosition] : undefined;

    switch (getAddress(userAddress!)) {
      case getAddress(line.borrower):
        const borrowerData = position
          ? { amount: position.principal, available: toBN(position.deposit).minus(toBN(position.principal)).toString() }
          : { amount: line.principal, available: toBN(line.deposit).minus(toBN(line.principal)).toString() };
        return {
          role: BORROWER_POSITION_ROLE,
          ...borrowerData,
        };

      case getAddress(line.arbiter):
        const arbiterData = {
          amount: unnullify(line.escrow?.collateralValue),
          available: unnullify(line.escrow?.collateralValue),
        };
        return {
          role: ARBITER_POSITION_ROLE,
          ...arbiterData,
        };

      case getAddress(position?.lender ?? ZERO_ADDRESS):
        const lenderData = {
          amount: position!.deposit,
          available: toBN(position!.deposit).minus(toBN(position!.principal)).toString(),
        };
        return {
          role: LENDER_POSITION_ROLE,
          ...lenderData,
        };

      default:
        // if no selected position, still try to find their position on the line
        const foundPosition = find(line.positions, (p) => p.lender === userAddress);
        if (foundPosition) {
          const lenderData = {
            amount: foundPosition.deposit,
            available: toBN(foundPosition.deposit).minus(toBN(foundPosition.principal)).toString(),
          };
          return {
            role: LENDER_POSITION_ROLE,
            ...lenderData,
          };
        }

        // user isnt a party on the line
        return defaultRole;
    }
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
  selectUserPositionMetadata,
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
