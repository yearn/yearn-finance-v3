import { createSelector } from '@reduxjs/toolkit';

import { RootState, CyToken, Status } from '@types';

const selectIronBankState = (state: RootState) => state.ironBank;
const selectTokensState = (state: RootState) => state.tokens;

const selectCyTokens = createSelector(
  [selectIronBankState, selectTokensState],
  (ironBankState, tokensState): CyToken[] => {
    const {
      cyTokenAddresses,
      cyTokensMap,
      user: { userCyTokensMap },
    } = ironBankState;
    const {
      tokensMap,
      user: { userTokensMap },
    } = tokensState;
    const cyTokens: CyToken[] = cyTokenAddresses.map((address) => {
      const cyTokenData = cyTokensMap[address];
      const userCyTokenData = userCyTokensMap[address];
      const tokenData = tokensMap[cyTokenData.underlyingTokenAddress];
      const userTokenData = userTokensMap[cyTokenData.underlyingTokenAddress];
      return {
        address: cyTokenData.address,
        decimals: cyTokenData.decimals,
        name: cyTokenData.name,
        symbol: cyTokenData.symbol,
        underlyingTokenAddress: cyTokenData.underlyingTokenAddress,
        lendApy: cyTokenData.lendApy,
        borrowApy: cyTokenData.borrowApy,
        liquidity: cyTokenData.liquidity,
        collateralFactor: cyTokenData.collateralFactor,
        reserveFactor: cyTokenData.reserveFactor,
        isActive: cyTokenData.isActive,
        exchangeRate: cyTokenData.exchangeRate,
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
          decimals: tokenData.decimals,
          icon: tokenData?.icon,
          balance: userTokenData?.balance ?? '0',
          balanceUsdc: userTokenData?.balanceUsdc ?? '0',
          allowancesMap: userTokenData?.allowancesMap ?? {},
        },
      };
    });
    console.log({ cyTokens });
    return cyTokens;
  }
);

const selectIronBankGeneralStatus = createSelector(
  [selectIronBankState],
  (ironBankState): Status => {
    const { statusMap } = ironBankState;
    const loading =
      statusMap.initiateIronBank.loading || statusMap.getIronBankData.loading || statusMap.getCYTokens.loading;
    const error = statusMap.initiateIronBank.error || statusMap.getIronBankData.error || statusMap.getCYTokens.error;
    return { loading, error };
  }
);

export const IronBankSelectors = { selectCyTokens, selectIronBankGeneralStatus };
