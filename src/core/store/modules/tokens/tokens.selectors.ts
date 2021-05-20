import { createSelector } from '@reduxjs/toolkit';
import { RootState, TokenView } from '@types';

const selectTokensState = (state: RootState) => state.tokens;

const selectUserTokens = createSelector([selectTokensState], (tokensState): TokenView[] => {
  const { tokensMap } = tokensState;
  const { userTokensAddresses, userTokensMap, userTokensAllowancesMap } = tokensState.user;
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
      // priceUsdc: tokenData?.priceUsdc ?? '0',
    };
  });
  return tokens;
});

export const TokensSelectors = {
  selectTokensState,
  selectUserTokens,
};
