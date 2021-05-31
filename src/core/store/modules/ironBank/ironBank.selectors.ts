import { createSelector } from '@reduxjs/toolkit';

import { RootState, CyTokenView, Status } from '@types';
import BigNumber from 'bignumber.js';

const selectIronBankState = (state: RootState) => state.ironBank;
const selectSelectedCyTokenAddress = (state: RootState) => state.ironBank.selectedCyTokenAddress;

const selectCyTokensMap = (state: RootState) => state.ironBank.cyTokensMap;
const selectCyTokensAddresses = (state: RootState) => state.ironBank.cyTokenAddresses;
const selectCyTokensAllowancesMap = (state: RootState) => state.ironBank.user.marketsAllowancesMap;
const selectUserCyTokensMap = (state: RootState) => state.ironBank.user.userCyTokensMap;
const selectIronBankData = (state: RootState) => state.ironBank.ironBankData;

// tokens
const selectUserTokensMap = (state: RootState) => state.tokens.user.userTokensMap;
const selectUserTokensAllowancesMap = (state: RootState) => state.tokens.user.userTokensAllowancesMap;
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
    const cyTokens = cyTokenAddresses.map((address) => {
      const cyTokenData = cyTokensMap[address];
      const userCyTokenData = userCyTokensMap[address];
      const tokenData = tokensMap[cyTokenData.tokenId];
      const userTokenData = userTokensMap[cyTokenData.tokenId];
      const tokenAllowancesMap = userTokensAllowancesMap[cyTokenData.tokenId] ?? {};
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
          userDeposited: userCyTokenData?.LEND.underlyingTokenBalance.amount ?? '0',
          userDepositedUsdc: userCyTokenData?.LEND.underlyingTokenBalance.amountUsdc ?? '0',
        },
        BORROW: {
          userDeposited: userCyTokenData?.BORROW.underlyingTokenBalance.amount ?? '0',
          userDepositedUsdc: userCyTokenData?.BORROW.underlyingTokenBalance.amountUsdc ?? '0',
        },
        allowancesMap: cyTokensAllowancesMap[address] ?? {},

        enteredMarket: false, // TODO POPULATE WITH REAL DATA
        // enteredMarket: userCyTokenData?.metamask.enteredMarket ?? false,
        token: {
          address: tokenData.address,
          name: tokenData.name,
          symbol: tokenData.symbol,
          decimals: parseInt(tokenData.decimals),
          icon: tokenData?.icon,
          balance: userTokenData?.balance ?? '0',
          balanceUsdc: userTokenData?.balanceUsdc ?? '0',
          priceUsdc: tokenData?.priceUsdc ?? '0',
          allowancesMap: tokenAllowancesMap,
        },
      };
    });
    return cyTokens;
  }
);

const selectLendMarkets = createSelector([selectCyTokens], (markets): CyTokenView[] => {
  const lendMarkets = markets.map(({ BORROW, LEND, token, ...rest }) => ({ token, ...LEND, ...rest }));
  return lendMarkets.filter((market) => new BigNumber(market.userDeposited).gt(0));
});

const selectBorrowMarkets = createSelector([selectCyTokens], (markets) => {
  const borrowMarkets = markets.map(({ BORROW, LEND, token, ...rest }) => ({ token, ...BORROW, ...rest }));
  return borrowMarkets.filter((market) => new BigNumber(market.userDeposited).gt(0));
});

export const IronBankSelectors = {
  selectCyTokens,
  selectIronBankData,
  selectLendMarkets,
  selectBorrowMarkets,
};
