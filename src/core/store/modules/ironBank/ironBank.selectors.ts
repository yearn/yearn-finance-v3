import { createSelector } from '@reduxjs/toolkit';

import { RootState, CyToken, Status } from '@types';

const selectIronBankState = (state: RootState) => state.ironBank;
const selectTokensState = (state: RootState) => state.tokens;
const selectSelectedCyTokenAddress = (state: RootState) => state.ironBank.selectedCyTokenAddress;

const selectCyTokens = createSelector(
  // TODO use specific selectors for each needed state variable.
  [selectIronBankState, selectTokensState],
  (ironBankState, tokensState) => {
    const {
      cyTokenAddresses,
      cyTokensMap,
      user: { userCyTokensMap },
    } = ironBankState;
    const {
      tokensMap,
      user: { userTokensMap },
    } = tokensState;
    const cyTokens: any[] = cyTokenAddresses.map((address) => {
      const cyTokenData = cyTokensMap[address];
      const userCyTokenData = userCyTokensMap[address];
      const tokenData = tokensMap[cyTokenData.tokenId];
      const userTokenData = userTokensMap[cyTokenData.tokenId];
      const allowancesMap = tokensState.user.userTokensAllowancesMap[cyTokenData.tokenId] ?? {};
      return {
        address: cyTokenData.address,
        decimals: cyTokenData.decimals,
        name: cyTokenData.name,
        symbol: cyTokenData.symbol,
        underlyingTokenAddress: cyTokenData.tokenId,
        lendApy: cyTokenData.metadata.lendApyBips,
        borrowApy: cyTokenData.metadata.borrowApyBips,
        liquidity: cyTokenData.metadata.liquidityUsdc,
        collateralFactor: cyTokenData.metadata.collateralFactor,
        reserveFactor: cyTokenData.metadata.reserveFactor,
        isActive: cyTokenData.metadata.isActive,
        exchangeRate: cyTokenData.metadata.exchangeRate,
        suppliedBalance: userCyTokenData?.suppliedBalance ?? '0',
        suppliedBalanceUsdc: userCyTokenData?.suppliedBalanceUsdc ?? '0',
        borrowedBalance: userCyTokenData?.borrowedBalance ?? '0',
        borrowedBalanceUsdc: userCyTokenData?.borrowedBalanceUsdc ?? '0',
        allowancesMap: userCyTokenData?.allowancesMap ?? {},
        enteredMarket: userCyTokenData?.enteredMarket ?? false,
        borrowLimit: userCyTokenData?.borrowLimit ?? '0',
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

export const IronBankSelectors = { selectCyTokens, selectIronBankGeneralStatus, selectSelectedCyToken };
