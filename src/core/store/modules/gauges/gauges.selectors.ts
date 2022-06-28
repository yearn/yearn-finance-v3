import { createSelector } from '@reduxjs/toolkit';

import { RootState, TokenView, Gauge, GaugePositionsMap, GaugeView } from '@types';
import { toBN } from '@utils';

import { TokensSelectors, createToken } from '../tokens/tokens.selectors';

/* ---------------------------------- State --------------------------------- */
const selectGaugesState = (state: RootState) => state.gauges;
const selectGaugesAddresses = (state: RootState) => state.gauges.gaugesAddresses;
const selectGaugesMap = (state: RootState) => state.gauges.gaugesMap;
const selectSelectedGaugeAddress = (state: RootState) => state.gauges.selectedGaugeAddress;
const selectUserGaugesPositionsMap = (state: RootState) => state.gauges.user.userGaugesPositionsMap;
const selectGaugesStatusMap = (state: RootState) => state.gauges.statusMap;

/* ----------------------------- Main Selectors ----------------------------- */
const selectGauges = createSelector(
  [
    selectGaugesAddresses,
    selectGaugesMap,
    selectUserGaugesPositionsMap,
    TokensSelectors.selectTokensMap,
    TokensSelectors.selectUserTokensMap,
    TokensSelectors.selectUserTokensAllowancesMap,
  ],
  (
    gaugesAddresses,
    gaugesMap,
    userGaugesPositionsMap,
    tokensMap,
    userTokensMap,
    userTokensAllowancesMap
  ): GaugeView[] => {
    const gaugesViews = gaugesAddresses.map((address) => {
      const gauge = gaugesMap[address];
      const userGaugePositionsMap = userGaugesPositionsMap[address];
      const token = tokensMap[gauge.token];
      const userToken = userTokensMap[gauge.token];
      const tokenAllowancesMap = userTokensAllowancesMap[gauge.token];
      const tokenView = createToken({ tokenData: token, userTokenData: userToken, allowancesMap: tokenAllowancesMap });
      return createGaugeView({
        gauge,
        tokenView,
        userGaugePositionsMap,
      });
    });

    return gaugesViews;
  }
);

const selectGaugesWithRewards = createSelector([selectGauges], (gauges): GaugeView[] => {
  return gauges.filter((gauge) => toBN(gauge.YIELD.userBalance).gt(0));
});

const selectSelectedGauge = createSelector(
  [selectSelectedGaugeAddress, selectGauges],
  (selectedGaugeAddress, gauges) => {
    if (!selectedGaugeAddress) return undefined;

    return gauges.find(({ address }) => address === selectedGaugeAddress);
  }
);

const selectSummaryData = createSelector([selectGauges], (gauges) => {
  const rewards = gauges.reduce(
    (total, gauge) => {
      return {
        totalRewards: toBN(total.totalRewards).plus(gauge.YIELD.userDeposited).toString(),
        totalRewardsUsdc: toBN(total.totalRewardsUsdc).plus(gauge.YIELD.userDepositedUsdc).toString(),
      };
    },
    { totalRewards: '0', totalRewardsUsdc: '0' }
  );

  return rewards;
});

/* --------------------------------- Helper --------------------------------- */
interface CreateGaugeProps {
  gauge: Gauge;
  tokenView: TokenView;
  userGaugePositionsMap: GaugePositionsMap;
}

function createGaugeView({ gauge, tokenView, userGaugePositionsMap }: CreateGaugeProps): GaugeView {
  return {
    address: gauge.address,
    name: gauge.name,
    symbol: gauge.symbol,
    decimals: parseInt(gauge.decimals),
    balance: gauge.underlyingTokenBalance.amount,
    balanceUsdc: gauge.underlyingTokenBalance.amountUsdc,
    token: tokenView,
    DEPOSIT: {
      userBalance: userGaugePositionsMap?.DEPOSIT?.balance ?? '0',
      userDeposited: userGaugePositionsMap?.DEPOSIT?.underlyingTokenBalance.amount ?? '0',
      userDepositedUsdc: userGaugePositionsMap?.DEPOSIT?.underlyingTokenBalance.amountUsdc ?? '0',
    },
    YIELD: {
      userBalance: userGaugePositionsMap?.YIELD?.balance ?? '0',
      userDeposited: userGaugePositionsMap?.YIELD?.underlyingTokenBalance.amount ?? '0',
      userDepositedUsdc: userGaugePositionsMap?.YIELD?.underlyingTokenBalance.amountUsdc ?? '0',
    },
  };
}

export const GaugesSelectors = {
  selectGaugesState,
  selectGaugesAddresses,
  selectGaugesMap,
  selectSelectedGaugeAddress,
  selectUserGaugesPositionsMap,
  selectGaugesStatusMap,
  selectGauges,
  selectGaugesWithRewards,
  selectSelectedGauge,
  selectSummaryData,
};
