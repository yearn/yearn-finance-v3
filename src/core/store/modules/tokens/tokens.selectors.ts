import { createSelector } from '@reduxjs/toolkit';
import { RootState, TokenView, initialStatus } from '@types';
import BigNumber from 'bignumber.js';

const selectTokensState = (state: RootState) => state.tokens;
const selectTokensMap = (state: RootState) => state.tokens.tokensMap;
const selectTokensUser = (state: RootState) => state.tokens.user;
const selectUserTokensStatusMap = (state: RootState) => state.tokens.statusMap;

const selectUserTokens = createSelector([selectTokensMap, selectTokensUser], (tokensMap, user): TokenView[] => {
  const { userTokensAddresses, userTokensMap, userTokensAllowancesMap } = user;
  const tokens = userTokensAddresses.map((address) => {
    const tokenData = tokensMap[address];
    const userTokenData = userTokensMap[address];
    const allowancesMap = userTokensAllowancesMap[address] ?? {};
    return {
      address: userTokenData?.address,
      name: userTokenData?.token.name,
      symbol: userTokenData?.token.symbol,
      decimals: parseInt(userTokenData?.token.decimals),
      icon: tokenData?.icon,
      balance: userTokenData?.balance ?? '0',
      balanceUsdc: userTokenData?.balanceUsdc ?? '0',
      allowancesMap: allowancesMap,
      priceUsdc: userTokenData?.priceUsdc ?? '0',
    };
  });
  return tokens;
});

const selectSummaryData = createSelector([selectTokensState], (tokensState) => {
  const { userTokensAddresses, userTokensMap } = tokensState.user;
  let totalBalance: BigNumber = new BigNumber('0');
  if (userTokensAddresses.length) {
    totalBalance = userTokensAddresses.reduce((total, address) => {
      return total.plus(userTokensMap[address]?.balanceUsdc ?? '0');
    }, new BigNumber('0'));
  }

  return {
    totalBalance: totalBalance?.toString() ?? '0',
    tokensAmount: userTokensAddresses.length.toString(),
  };
});

const selectAllowance = (tokenAddress: string, spenderAddress: string) =>
  createSelector([selectUserTokens], (userTokens) => {
    return userTokens.find((token) => token.address === tokenAddress)?.allowancesMap[spenderAddress] ?? '0';
  });

const selectGetTokenAllowanceStatus = (spenderAddress: string) =>
  createSelector([selectUserTokensStatusMap], (userTokensStatusMap) => {
    return userTokensStatusMap.user.userTokensActionsMap[spenderAddress]?.getAllowances ?? initialStatus;
  });

export const TokensSelectors = {
  selectTokensState,
  selectTokensMap,
  selectTokensUser,
  selectUserTokensStatusMap,
  selectUserTokens,
  selectSummaryData,
  selectAllowance,
  selectGetTokenAllowanceStatus,
};
