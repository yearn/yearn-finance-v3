import { createSelector } from '@reduxjs/toolkit';
import { AllowancesMap, Balance, Lab, LabsPositionsMap, RootState, Token } from '@types';
import { getConstants } from '../../../../config/constants';

const { YVECRV, CRV, YVBOOST, YVBOOSTETH } = getConstants().CONTRACT_ADDRESSES;

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
const selectYvBoostEthLabData = (state: RootState) => state.labs.labsMap[YVBOOSTETH];
const selectUserYvBoostEthLabPositions = (state: RootState) => state.labs.user.userLabsPositionsMap[YVBOOSTETH];
const selectYvBoostEthLabAllowancesMap = (state: RootState) => state.labs.user.labsAllowancesMap[YVBOOSTETH];

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

interface CreateLabProps {
  labData: Lab;
  userPositions: LabsPositionsMap;
  labAllowances: AllowancesMap;
  tokenData: Token;
  userTokenData: Balance;
  tokenAllowancesMap: AllowancesMap;
}
function createLab(props: CreateLabProps) {
  const { labAllowances, labData, tokenAllowancesMap, tokenData, userPositions, userTokenData } = props;
  return {
    address: labData.address,
    name: labData.name,
    labBalance: labData.underlyingTokenBalance.amount,
    decimals: labData.decimals,
    labBalanceUsdc: labData.underlyingTokenBalance.amountUsdc,
    apyData: '0', // TODO use labData.metadata.apy?.recommended.toString() ?? '0',
    allowancesMap: labAllowances ?? {},
    pricePerShare: '1', // TODO use labData?.metadata.pricePerShare,
    DEPOSIT: {
      userBalance: userPositions?.DEPOSIT?.balance ?? '0',
      userDeposited: userPositions?.DEPOSIT?.underlyingTokenBalance.amount ?? '0',
      userDepositedUsdc: userPositions?.DEPOSIT?.underlyingTokenBalance.amountUsdc ?? '0',
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
};
