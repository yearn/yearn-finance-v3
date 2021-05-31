import { createSelector } from '@reduxjs/toolkit';

import { RootState, CyToken, Status } from '@types';

const selectIronBankState = (state: RootState) => state.ironBank;
const selectSelectedCyTokenAddress = (state: RootState) => state.ironBank.selectedCyTokenAddress;

const selectCyTokensMap = (state: RootState) => state.ironBank.cyTokensMap;
const selectCyTokensAddresses = (state: RootState) => state.ironBank.cyTokenAddresses;
const selectCyTokensAllowancesMap = (state: RootState) => state.ironBank.user.marketsAllowancesMap;
const selectUserCyTokensMap = (state: RootState) => state.ironBank.user.userCyTokensMap;
const selectIronBankData = (state: RootState) => state.ironBank.ironBankData;

// tokens
const selectUserTokensMap = (state: RootState) => state.tokens.user.userTokensMap;
const selectUserTokensAllowancesMap = (state: RootState) => state.tokens.user.userTokensMap;
const selectTokensMap = (state: RootState) => state.tokens.tokensMap;

const selectCyTokens = createSelector(
  [
    selectCyTokensMap,
    selectCyTokensAddresses,
    selectTokensMap,
    selectUserCyTokensMap,
    selectUserTokensMap,
    selectCyTokensAllowancesMap,
    selectUserTokensAllowancesMap,
    selectIronBankData,
  ],
  (
    cyTokensMap,
    cyTokenAddresses,
    tokensMap,
    userCyTokensMap,
    userTokensMap,
    cyTokensAllowancesMap,
    userTokensAllowancesMap,
    ironBankData
  ) => {
    const cyTokens: any[] = cyTokenAddresses.map((address) => {
      const cyTokenData = cyTokensMap[address];
      const userCyTokenData = userCyTokensMap[address];
      const tokenData = tokensMap[cyTokenData.tokenId];
      const userTokenData = userTokensMap[cyTokenData.tokenId];
      const allowancesMap = userTokensAllowancesMap[cyTokenData.tokenId] ?? {};
      return {
        address: cyTokenData.address,
        decimals: cyTokenData.decimals,
        name: cyTokenData.name,
        symbol: cyTokenData.symbol,
        lendApy: cyTokenData.metadata.lendApyBips,
        borrowApy: cyTokenData.metadata.borrowApyBips,
        liquidity: cyTokenData.metadata.liquidityUsdc,
        collateralFactor: cyTokenData.metadata.collateralFactor,
        reserveFactor: cyTokenData.metadata.reserveFactor,
        isActive: cyTokenData.metadata.isActive,
        exchangeRate: cyTokenData.metadata.exchangeRate,
        borrowLimit: ironBankData?.borrowLimitUsdc ?? '0',
        LEND: {
          suppliedBalance: userCyTokenData?.LEND.underlyingTokenBalance.amount ?? '0',
          suppliedBalanceUsdc: userCyTokenData?.LEND.underlyingTokenBalance.amountUsdc ?? '0',
        },
        BORROW: {
          borrowedBalance: userCyTokenData?.BORROW.underlyingTokenBalance.amount ?? '0',
          borrowedBalanceUsdc: userCyTokenData?.BORROW.underlyingTokenBalance.amountUsdc ?? '0',
        },

        // TODO POPULATE WITH REAL DATA
        allowancesMap: {},
        enteredMarket: false,
        // allowancesMap: userCyTokenData?.allowancesMap ?? {},
        // enteredMarket: userCyTokenData?.enteredMarket ?? false,
        token: {
          address: tokenData.address,
          name: tokenData.name,
          symbol: tokenData.symbol,
          decimals: parseInt(tokenData.decimals),
          icon: tokenData?.icon,
          balance: userTokenData?.balance ?? '0',
          balanceUsdc: userTokenData?.balanceUsdc ?? '0',
          priceUsdc: tokenData?.priceUsdc ?? '0',
          allowancesMap: allowancesMap,
        },
      };
    });
    return cyTokens;
  }
);

const selectIronBankGeneralStatus = createSelector(
  // TODO use specific selectors for each needed state variable.
  [selectIronBankState],
  (ironBankState): Status => {
    const { statusMap } = ironBankState;
    const loading =
      statusMap.initiateIronBank.loading || statusMap.getIronBankData.loading || statusMap.getCYTokens.loading;
    const error = statusMap.initiateIronBank.error || statusMap.getIronBankData.error || statusMap.getCYTokens.error;
    return { loading, error };
  }
);

const selectSelectedCyToken = createSelector(
  // TODO use specific selectors for each needed state variable.
  [selectCyTokens, selectSelectedCyTokenAddress],
  (cyTokens, selectedCyTokenAddress): CyToken | undefined => {
    if (!selectedCyTokenAddress) {
      return undefined;
    }
    const selectedCyToken = cyTokens.find((cyToken) => cyToken.address === selectedCyTokenAddress);
    return selectedCyToken;
  }
);

export const IronBankSelectors = {
  selectCyTokens,
  selectIronBankGeneralStatus,
  selectSelectedCyToken,
  selectIronBankData,
};
