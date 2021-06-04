import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

import { RootState, TokenView } from '@types';
import { getConfig } from '@config';

const selectTokensState = (state: RootState) => state.tokens;
const selectTokensMap = (state: RootState) => state.tokens.tokensMap;
const selectTokensUser = (state: RootState) => state.tokens.user;
const selectUserTokensStatusMap = (state: RootState) => state.tokens.statusMap;

const selectUserTokensAddresses = (state: RootState) => state.tokens.user.userTokensAddresses;
const selectUserTokensMap = (state: RootState) => state.tokens.user.userTokensMap;

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

const selectSummaryData = createSelector([selectUserTokens], (userTokens) => {
  let totalBalance: BigNumber = new BigNumber('0');
  userTokens.forEach((userToken) => totalBalance.plus(userToken.balanceUsdc));

  return {
    totalBalance: totalBalance?.toString() ?? '0',
    tokensAmount: userTokens.length.toString(),
  };
});

const selectZapOutTokens = createSelector([selectTokensMap], (tokensMap) => {
  const { ZAP_OUT_TOKENS } = getConfig();
  const tokens = ZAP_OUT_TOKENS.map((address) => {
    const tokenData = tokensMap[address];
    return {
      address: tokenData?.address,
      name: tokenData?.name,
      symbol: tokenData?.symbol,
      decimals: parseInt(tokenData?.decimals),
      icon: tokenData?.icon,
      priceUsdc: tokenData?.priceUsdc ?? '0',
    };
  });
  return tokens;
});

export const TokensSelectors = {
  selectTokensState,
  selectTokensMap,
  selectTokensUser,
  selectUserTokensStatusMap,
  selectUserTokens,
  selectSummaryData,
  selectZapOutTokens,
};
