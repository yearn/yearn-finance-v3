import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@types';
import { getConstants } from '../../../../config/constants';

const selectLabsState = (state: RootState) => state.labs;

const { YVECRV, CRV } = getConstants().CONTRACT_ADDRESSES;

// general selectors
const selectCrvTokenData = (state: RootState) => state.tokens.tokensMap[CRV];
const selectUserCrvTokenData = (state: RootState) => state.tokens.user.userTokensMap[CRV];
const selectCrvTokenAllowancesMap = (state: RootState) => state.tokens.user.userTokensAllowancesMap[CRV];

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
  (labData, userPositions, labAllowances, crvTokenData, userCrvTokenData, crvTokenAllowancesMap) => {
    if (!labData) return undefined;
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
      YIELD: {
        userBalance: userPositions?.YIELD?.balance ?? '0',
        userDeposited: userPositions?.YIELD?.underlyingTokenBalance.amount ?? '0',
        userDepositedUsdc: userPositions?.YIELD?.underlyingTokenBalance.amountUsdc ?? '0',
      },
      token: {
        crv: {
          address: crvTokenData?.address,
          name: crvTokenData?.name,
          symbol: crvTokenData?.symbol,
          decimals: parseInt(crvTokenData?.decimals),
          icon: crvTokenData?.icon,
          balance: userCrvTokenData?.balance ?? '0',
          balanceUsdc: userCrvTokenData?.balanceUsdc ?? '0',
          priceUsdc: crvTokenData?.priceUsdc ?? '0',
          allowancesMap: crvTokenAllowancesMap ?? {},
        },
      },
    };
  }
);

export const LabsSelectors = {
  selectLabsState,
  selectYveCrvLab,
};
