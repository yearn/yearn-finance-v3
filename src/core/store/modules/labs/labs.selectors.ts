import { createSelector } from '@reduxjs/toolkit';
import { AllowancesMap, Balance, Lab, LabsPositionsMap, RootState, Token, Status } from '@types';
import { getConstants } from '../../../../config/constants';
import { toBN } from '../../../../utils';
import { GeneralLabView } from '../../../types/Lab';

const { YVECRV, CRV, YVBOOST, PSLPYVBOOSTETH } = getConstants().CONTRACT_ADDRESSES;

// general selectors
const selectCrvTokenData = (state: RootState) => state.tokens.tokensMap[CRV];
const selectUserCrvTokenData = (state: RootState) => state.tokens.user.userTokensMap[CRV];
const selectCrvTokenAllowancesMap = (state: RootState) => state.tokens.user.userTokensAllowancesMap[CRV];

const selectYveCrvTokenData = (state: RootState) => state.tokens.tokensMap[YVECRV];
const selectUserYveCrvTokenData = (state: RootState) => state.tokens.user.userTokensMap[YVECRV];
const selectYveCrvTokenAllowancesMap = (state: RootState) => state.tokens.user.userTokensAllowancesMap[YVECRV];

const selectYvBoostData = (state: RootState) => state.tokens.tokensMap[YVBOOST];
const selectUserYvBoostData = (state: RootState) => state.tokens.user.userTokensMap[YVBOOST];
const selectYvBoostAllowancesMap = (state: RootState) => state.tokens.user.userTokensAllowancesMap[YVBOOST];

const selectSelectedLabAddress = (state: RootState) => state.labs.selectedLabAddress;
const selectGetLabsStatus = (state: RootState) => state.labs.statusMap.getLabs;
const selectGetUserLabsPositionsStatus = (state: RootState) => state.labs.statusMap.user.getUserLabsPositions;

// yveCrv selectors
const selectYveCrvLabData = (state: RootState) => state.labs.labsMap[YVECRV];
const selectUserYveCrvLabPositions = (state: RootState) => state.labs.user.userLabsPositionsMap[YVECRV];
const selectYveCrvLabAllowancesMap = (state: RootState) => state.labs.user.labsAllowancesMap[YVECRV];

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
    return createLab({ labAllowances, labData, tokenAllowancesMap, tokenData, userPositions, userTokenData });
  }
);

// yvBoost selectors
const selectYvBoostLabData = (state: RootState) => state.labs.labsMap[YVBOOST];
const selectUserYvBoostLabPositions = (state: RootState) => state.labs.user.userLabsPositionsMap[YVBOOST];
const selectYvBoostLabAllowancesMap = (state: RootState) => state.labs.user.labsAllowancesMap[YVBOOST];

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
    return createLab({ labAllowances, labData, tokenAllowancesMap, tokenData, userPositions, userTokenData });
  }
);

// yvBoost-eth selectors
const selectYvBoostEthLabData = (state: RootState) => state.labs.labsMap[PSLPYVBOOSTETH];
const selectUserYvBoostEthLabPositions = (state: RootState) => state.labs.user.userLabsPositionsMap[PSLPYVBOOSTETH];
const selectYvBoostEthLabAllowancesMap = (state: RootState) => state.labs.user.labsAllowancesMap[PSLPYVBOOSTETH];

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
    return createLab({ labAllowances, labData, tokenAllowancesMap, tokenData, userPositions, userTokenData });
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
    return labs;
  }
);

const selectDepositedLabs = createSelector([selectLabs], (labs) => {
  return labs.filter((lab) => toBN(lab?.DEPOSIT.userBalance).gt(0));
});

const selectLabsOpportunities = createSelector([selectLabs], (labs) => {
  return labs.filter((lab) => toBN(lab?.DEPOSIT.userBalance).lte(0));
});

const selectRecommendations = createSelector([selectLabs], (labs) => {
  // TODO criteria
  return labs;
});

const selectSelectedLab = createSelector([selectLabs, selectSelectedLabAddress], (labs, selectedLabAddress) => {
  if (!selectedLabAddress) {
    return undefined;
  }
  return labs.find((lab) => lab.address === selectedLabAddress);
});

const selectSummaryData = createSelector([selectDepositedLabs], (depositedLabs) => {
  let totalDeposited = toBN('0');
  depositedLabs.forEach((lab) => (totalDeposited = totalDeposited.plus(lab.DEPOSIT.userDepositedUsdc)));

  return {
    totalDeposits: totalDeposited.toString(),
    totalEarnings: '0',
    estYearlyYeild: '0',
  };
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

interface CreateLabProps {
  labData: Lab;
  userPositions: LabsPositionsMap;
  labAllowances: AllowancesMap;
  tokenData: Token;
  userTokenData: Balance;
  tokenAllowancesMap: AllowancesMap;
}

function createLab(props: CreateLabProps): GeneralLabView {
  const { labAllowances, labData, tokenAllowancesMap, tokenData, userPositions, userTokenData } = props;
  return {
    address: labData.address,
    name: labData.name,
    icon: labData.metadata.icon ?? tokenData?.icon ?? '',
    labBalance: labData.underlyingTokenBalance.amount,
    decimals: labData.decimals,
    labBalanceUsdc: labData.underlyingTokenBalance.amountUsdc,
    apyData: labData.metadata.apy?.recommended.toString() ?? '0',
    allowancesMap: labAllowances ?? {},
    pricePerShare: labData.metadata.pricePerShare,
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
    token: {
      address: tokenData?.address,
      name: tokenData?.name,
      symbol: tokenData?.symbol,
      decimals: parseInt(tokenData?.decimals),
      icon: tokenData?.icon,
      balance: userTokenData?.balance ?? '0',
      balanceUsdc: userTokenData?.balanceUsdc ?? '0',
      priceUsdc: tokenData?.priceUsdc ?? '0',
      allowancesMap: tokenAllowancesMap ?? {},
    },
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
};
