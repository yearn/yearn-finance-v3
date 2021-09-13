import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

import { AllowancesMap, Balance, RootState, Status, Token, TokenView } from '@types';
import { getConfig } from '@config';
import { memoize } from 'lodash';

const selectTokensState = (state: RootState) => state.tokens;
const selectTokensMap = (state: RootState) => state.tokens.tokensMap;
const selectSelectedTokenAddress = (state: RootState) => state.tokens.selectedTokenAddress;
const selectTokensUser = (state: RootState) => state.tokens.user;
const selectUserTokensStatusMap = (state: RootState) => state.tokens.statusMap;
const selectGetTokensStatus = (state: RootState) => state.tokens.statusMap.getTokens;
const selectGetUserTokensStatus = (state: RootState) => state.tokens.statusMap.user.getUserTokens;

const selectUserTokensAddresses = (state: RootState) => state.tokens.user.userTokensAddresses;
const selectUserTokensMap = (state: RootState) => state.tokens.user.userTokensMap;

const selectUserTokens = createSelector([selectTokensMap, selectTokensUser], (tokensMap, user): TokenView[] => {
  const { userTokensAddresses, userTokensMap, userTokensAllowancesMap } = user;
  const tokens = userTokensAddresses.map((address) => {
    const tokenData = tokensMap[address];
    const userTokenData = userTokensMap[address];
    const allowancesMap = userTokensAllowancesMap[address] ?? {};
    return createToken({ tokenData, userTokenData, allowancesMap });
  });
  return tokens;
});

const selectSummaryData = createSelector([selectUserTokens], (userTokens) => {
  let totalBalance: BigNumber = new BigNumber('0');
  userTokens.forEach((userToken) => (totalBalance = totalBalance.plus(userToken.balanceUsdc)));

  return {
    totalBalance: totalBalance?.toString() ?? '0',
    tokensAmount: userTokens.length.toString(),
  };
});

const selectZapInTokens = createSelector([selectUserTokens], (userTokens) => {
  return userTokens.filter(({ isZapable }) => isZapable);
});

const selectZapOutTokens = createSelector([selectTokensMap, selectUserTokensMap], (tokensMap, userTokensMap) => {
  const { ZAP_OUT_TOKENS } = getConfig();
  const tokens = ZAP_OUT_TOKENS.map((address) => {
    const tokenData = tokensMap[address];
    const userTokenData = userTokensMap[address];
    return {
      address: tokenData?.address,
      name: tokenData?.name,
      symbol: tokenData?.symbol,
      decimals: parseInt(tokenData?.decimals),
      icon: tokenData?.icon,
      balance: userTokenData?.balance ?? '0',
      balanceUsdc: userTokenData?.balanceUsdc ?? '0',
      priceUsdc: tokenData?.priceUsdc ?? '0',
    };
  });
  return tokens;
});

const selectWalletTokensStatus = createSelector(
  [selectGetTokensStatus, selectGetUserTokensStatus],
  (getTokensStatus, getUserTokensStatus): Status => {
    return {
      loading: getTokensStatus.loading || getUserTokensStatus.loading,
      error: getTokensStatus.error || getUserTokensStatus.error,
    };
  }
);

const selectToken = createSelector([selectTokensMap, selectTokensUser], (tokensMap, user) =>
  memoize((tokenAddress: string): TokenView => {
    const { userTokensMap, userTokensAllowancesMap } = user; // use specific selectors, is not a big performance improvement in this case
    const tokenData = tokensMap[tokenAddress];
    const userTokenData = userTokensMap[tokenAddress];
    const allowancesMap = userTokensAllowancesMap[tokenAddress] ?? {};
    return createToken({ tokenData, userTokenData, allowancesMap });
  })
);

interface CreateTokenProps {
  tokenData: Token;
  userTokenData: Balance;
  allowancesMap: AllowancesMap;
}

function createToken(props: CreateTokenProps): TokenView {
  const { tokenData, userTokenData, allowancesMap } = props;
  return {
    address: tokenData?.address,
    name: tokenData?.name,
    symbol: tokenData?.symbol,
    decimals: parseInt(tokenData?.decimals),
    icon: tokenData?.icon,
    balance: userTokenData?.balance ?? '0',
    balanceUsdc: userTokenData?.balanceUsdc ?? '0',
    priceUsdc: tokenData?.priceUsdc ?? '0',
    categories: tokenData?.metadata?.categories ?? [],
    description: tokenData?.metadata?.description ?? '',
    website: tokenData?.metadata?.website ?? '',
    isZapable: tokenData?.supported.zapper ?? false,
    allowancesMap: allowancesMap,
  };
}

export const TokensSelectors = {
  selectTokensState,
  selectTokensMap,
  selectSelectedTokenAddress,
  selectTokensUser,
  selectUserTokensStatusMap,
  selectUserTokens,
  selectSummaryData,
  selectZapInTokens,
  selectZapOutTokens,
  selectWalletTokensStatus,
  selectToken,
};
