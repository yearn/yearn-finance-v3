import { createSelector } from '@reduxjs/toolkit';

import {
  AllowancesMap,
  Balance,
  Lab,
  LabsPositionsMap,
  RootState,
  Token,
  Status,
  GeneralLabView,
  LabActionsStatusMap,
  LabsPositionsTypes,
} from '@types';
import { getConstants } from '@config/constants';
import { computeSummaryData, toBN } from '@utils';

import { createToken } from '../tokens/tokens.selectors';

import { initialLabActionsStatusMap } from './labs.reducer';

const { YVECRV, CRV, YVBOOST, PSLPYVBOOSTETH } = getConstants().CONTRACT_ADDRESSES;

// general selectors
const selectCrvTokenData = (state: RootState) => state.tokens.tokensMap[CRV];
const selectUserCrvTokenData = (state: RootState) => state.tokens.user.userTokensMap[CRV];
const selectCrvTokenAllowancesMap = (state: RootState) => state.tokens.user.userTokensAllowancesMap[CRV];

const selectYveCrvTokenData = (state: RootState) => state.tokens.tokensMap[YVECRV];
const selectUserYveCrvTokenData = (state: RootState) => state.tokens.user.userTokensMap[YVECRV];
const selectYveCrvTokenAllowancesMap = (state: RootState) => state.tokens.user.userTokensAllowancesMap[YVECRV];

const selectYvBoostData = (state: RootState) => state.tokens.tokensMap[YVBOOST];
const selectUserYvBoostData = (state: RootState) => {
  const userToken = state.tokens.user.userTokensMap[YVBOOST];
  if (userToken) {
    return userToken;
  }

  // if yvBOOST not in userTokensMap, get balance from lab positions
  const token = state.tokens.tokensMap[YVBOOST];
  const position = state.labs.user.userLabsPositionsMap[YVBOOST]?.DEPOSIT;
  if (!token || !position) {
    return userToken;
  }

  const balance: Balance = {
    address: position.assetAddress,
    token: {
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
    },
    balance: position.balance,
    balanceUsdc: position.underlyingTokenBalance.amountUsdc,
    priceUsdc: token.priceUsdc,
  };
  return balance;
};
const selectYvBoostAllowancesMap = (state: RootState) => state.tokens.user.userTokensAllowancesMap[YVBOOST];

const selectSelectedLabAddress = (state: RootState) => state.labs.selectedLabAddress;
const selectGetLabsStatus = (state: RootState) => state.labs.statusMap.getLabs;
const selectLabsActionsStatusMap = (state: RootState) => state.labs.statusMap.labsActionsStatusMap;
const selectGetUserLabsPositionsStatus = (state: RootState) => state.labs.statusMap.user.getUserLabsPositions;

// yveCrv selectors
const selectYveCrvLabData = (state: RootState) => state.labs.labsMap[YVECRV];
const selectUserYveCrvLabPositions = (state: RootState) => state.labs.user.userLabsPositionsMap[YVECRV];
const selectYveCrvLabAllowancesMap = (state: RootState) => state.tokens.user.userTokensAllowancesMap[YVECRV];

const selectYveCrvLab = createSelector(
  [
    selectYveCrvLabData,
    selectUserYveCrvLabPositions,
    selectYveCrvLabAllowancesMap,
    selectCrvTokenData,
    selectUserCrvTokenData,
    selectCrvTokenAllowancesMap,
  ],
  (labData, userPositions, labAllowances, tokenData, userTokenData, tokenAllowancesMap) => {
    if (!labData) return undefined;
    return createLab({
      labAllowances,
      labData,
      tokenAllowancesMap,
      tokenData,
      userPositions,
      userTokenData,
      mainPositionKey: 'DEPOSIT',
    });
  }
);

// yvBoost selectors
const selectYvBoostLabData = (state: RootState) => state.labs.labsMap[YVBOOST];
const selectUserYvBoostLabPositions = (state: RootState) => state.labs.user.userLabsPositionsMap[YVBOOST];
const selectYvBoostLabAllowancesMap = (state: RootState) => state.tokens.user.userTokensAllowancesMap[YVBOOST];

const selectYvBoostLab = createSelector(
  [
    selectYvBoostLabData,
    selectUserYvBoostLabPositions,
    selectYvBoostLabAllowancesMap,
    selectYveCrvTokenData,
    selectUserYveCrvTokenData,
    selectYveCrvTokenAllowancesMap,
  ],
  (labData, userPositions, labAllowances, tokenData, userTokenData, tokenAllowancesMap) => {
    if (!labData) return undefined;
    return createLab({
      labAllowances,
      labData,
      tokenAllowancesMap,
      tokenData,
      userPositions,
      userTokenData,
      mainPositionKey: 'DEPOSIT',
    });
  }
);

// yvBoost-eth selectors
const selectYvBoostEthLabData = (state: RootState) => state.labs.labsMap[PSLPYVBOOSTETH];
const selectUserYvBoostEthLabPositions = (state: RootState) => state.labs.user.userLabsPositionsMap[PSLPYVBOOSTETH];
const selectYvBoostEthLabAllowancesMap = (state: RootState) =>
  state.tokens.user.userTokensAllowancesMap[PSLPYVBOOSTETH];

const selectYvBoostEthLab = createSelector(
  [
    selectYvBoostEthLabData,
    selectUserYvBoostEthLabPositions,
    selectYvBoostEthLabAllowancesMap,
    selectYvBoostData,
    selectUserYvBoostData,
    selectYvBoostAllowancesMap,
  ],
  (labData, userPositions, labAllowances, tokenData, userTokenData, tokenAllowancesMap) => {
    if (!labData) return undefined;
    return createLab({
      labAllowances,
      labData,
      tokenAllowancesMap,
      tokenData,
      userPositions,
      userTokenData,
      mainPositionKey: 'STAKE',
    });
  }
);

// General selectors
const selectLabs = createSelector(
  [selectYveCrvLab, selectYvBoostLab, selectYvBoostEthLab],
  (yveCrvLab, yvBoostLab, yvBoostEthLab) => {
    const labs: GeneralLabView[] = [];
    [yveCrvLab, yvBoostLab, yvBoostEthLab].forEach((lab) => {
      if (lab) labs.push(lab);
    });

    labs.sort((a, b) => {
      return toBN(b.token.balance).minus(a.token.balance).toNumber();
    });
    return labs;
  }
);

const selectDepositedLabs = createSelector([selectLabs], (labs) => {
  return labs.filter((lab) => toBN(lab?.DEPOSIT.userBalance).plus(lab?.STAKE.userBalance).gt(0));
});

const selectLabsOpportunities = createSelector([selectLabs], (labs) => {
  return labs.filter((lab) => toBN(lab?.DEPOSIT.userBalance).plus(lab?.STAKE.userBalance).lte(0));
});

const selectRecommendations = createSelector([selectLabs], (labs) => {
  // TODO criteria
  return labs.slice(0, 3).sort((a, b) => Number(b.apyData) - Number(a.apyData));
});

const selectSelectedLab = createSelector([selectLabs, selectSelectedLabAddress], (labs, selectedLabAddress) => {
  if (!selectedLabAddress) {
    return undefined;
  }
  return labs.find((lab) => lab.address === selectedLabAddress);
});

const selectSummaryData = createSelector([selectDepositedLabs], (depositedLabs) => {
  return computeSummaryData(depositedLabs);
});

const selectLabsStatus = createSelector(
  [selectGetLabsStatus, selectGetUserLabsPositionsStatus],
  (getLabsStatus, getUserLabsPositionsStatus): Status => {
    return {
      loading: getLabsStatus.loading || getUserLabsPositionsStatus.loading,
      error: getLabsStatus.error || getUserLabsPositionsStatus.error,
    };
  }
);

const selectSelectedLabActionsStatusMap = createSelector(
  [selectLabsActionsStatusMap, selectSelectedLabAddress],
  (labsActionsStatusMap, selectedLabAddress): LabActionsStatusMap => {
    return selectedLabAddress ? labsActionsStatusMap[selectedLabAddress] : initialLabActionsStatusMap;
  }
);

interface CreateLabProps {
  labData: Lab;
  userPositions: LabsPositionsMap;
  labAllowances: AllowancesMap;
  tokenData: Token;
  userTokenData: Balance;
  tokenAllowancesMap: AllowancesMap;
  mainPositionKey: LabsPositionsTypes;
}

function createLab(props: CreateLabProps): GeneralLabView {
  const { labAllowances, labData, tokenAllowancesMap, tokenData, userPositions, userTokenData, mainPositionKey } =
    props;
  return {
    address: labData.address,
    name: labData.name,
    displayName: labData.metadata.displayName,
    displayIcon: labData.metadata.displayIcon,
    defaultDisplayToken: labData.metadata.defaultDisplayToken,
    decimals: labData.decimals,
    labBalance: labData.underlyingTokenBalance.amount,
    labBalanceUsdc: labData.underlyingTokenBalance.amountUsdc,
    apyData: labData.metadata.apy?.net_apy.toString() ?? '0',
    apyMetadata: labData.metadata.apy,
    allowancesMap: labAllowances ?? {},
    pricePerShare: labData.metadata.pricePerShare,
    allowZapIn: true,
    allowZapOut: true,
    mainPositionKey,
    DEPOSIT: {
      userBalance: userPositions?.DEPOSIT?.balance ?? '0',
      userDeposited: userPositions?.DEPOSIT?.underlyingTokenBalance.amount ?? '0',
      userDepositedUsdc: userPositions?.DEPOSIT?.underlyingTokenBalance.amountUsdc ?? '0',
    },
    YIELD: {
      userBalance: userPositions?.YIELD?.balance ?? '0',
      userDeposited: userPositions?.YIELD?.underlyingTokenBalance.amount ?? '0',
      userDepositedUsdc: userPositions?.YIELD?.underlyingTokenBalance.amountUsdc ?? '0',
    },
    STAKE: {
      userBalance: userPositions?.STAKE?.balance ?? '0',
      userDeposited: userPositions?.STAKE?.underlyingTokenBalance.amount ?? '0',
      userDepositedUsdc: userPositions?.STAKE?.underlyingTokenBalance.amountUsdc ?? '0',
    },
    token: createToken({ tokenData, userTokenData, allowancesMap: tokenAllowancesMap }),
  };
}

export const LabsSelectors = {
  selectYveCrvLab,
  selectYvBoostLab,
  selectYvBoostEthLab,
  selectLabs,
  selectDepositedLabs,
  selectLabsOpportunities,
  selectRecommendations,
  selectSelectedLab,
  selectSummaryData,
  selectLabsStatus,
  selectSelectedLabActionsStatusMap,
};
