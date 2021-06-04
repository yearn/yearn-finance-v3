import { createSelector } from '@reduxjs/toolkit';

import { RootState, IronBankMarketView, Status } from '@types';
import BigNumber from 'bignumber.js';

const selectMarketsMap = (state: RootState) => state.ironBank.marketsMap;
const selectMarketsAddresses = (state: RootState) => state.ironBank.marketAddresses;
const selectMarketsAllowancesMap = (state: RootState) => state.ironBank.user.marketsAllowancesMap;
const selectUserMarketsPositionsMap = (state: RootState) => state.ironBank.user.userMarketsPositionsMap;
const selectUserMarketsMetadataMap = (state: RootState) => state.ironBank.user.userMarketsMetadataMap;
const selectIronBankData = (state: RootState) => state.ironBank.ironBankData;

const selectGetIronBankDataStatus = (state: RootState) => state.ironBank.statusMap.getIronBankData;
const selectGetMarketsStatus = (state: RootState) => state.ironBank.statusMap.getMarkets;
const selectGetUserMarketsPositionsStatus = (state: RootState) => state.ironBank.statusMap.user.getUserMarketsPositions;
const selectGetUserMarketsMetadataStatus = (state: RootState) => state.ironBank.statusMap.user.getUserMarketsMetadata;

// tokens
const selectUserTokensMap = (state: RootState) => state.tokens.user.userTokensMap;
const selectUserTokensAllowancesMap = (state: RootState) => state.tokens.user.userTokensAllowancesMap;
const selectTokensMap = (state: RootState) => state.tokens.tokensMap;

const selectMarkets = createSelector(
  [
    selectMarketsMap,
    selectMarketsAddresses,
    selectTokensMap,
    selectUserMarketsPositionsMap,
    selectUserMarketsMetadataMap,
    selectUserTokensMap,
    selectMarketsAllowancesMap,
    selectUserTokensAllowancesMap,
    selectIronBankData,
  ],
  (
    marketsMap,
    marketAddresses,
    tokensMap,
    userMarketsPositionsMap,
    userMarketsMetadataMap,
    userTokensMap,
    marketsAllowancesMap,
    userTokensAllowancesMap,
    ironBankData
  ) => {
    const markets = marketAddresses.map((address) => {
      const marketData = marketsMap[address];
      const userMarketPositionData = userMarketsPositionsMap[address];
      const userMarketMetadata = userMarketsMetadataMap[address];
      const tokenData = tokensMap[marketData.tokenId];
      const userTokenData = userTokensMap[marketData.tokenId];
      const tokenAllowancesMap = userTokensAllowancesMap[marketData.tokenId] ?? {};
      return {
        address: marketData.address,
        decimals: marketData.decimals,
        name: marketData.name,
        symbol: marketData.symbol,
        lendApy: marketData.metadata.lendApyBips,
        borrowApy: marketData.metadata.borrowApyBips,
        liquidity: marketData.metadata.liquidityUsdc,
        collateralFactor: marketData.metadata.collateralFactor,
        reserveFactor: marketData.metadata.reserveFactor,
        isActive: marketData.metadata.isActive,
        exchangeRate: marketData.metadata.exchangeRate,
        borrowLimit: ironBankData?.borrowLimitUsdc ?? '0',
        allowancesMap: marketsAllowancesMap[address] ?? {},
        enteredMarket: userMarketMetadata?.enteredMarket ?? false,
        LEND: {
          userDeposited: userMarketPositionData?.LEND?.underlyingTokenBalance.amount ?? '0',
          userDepositedUsdc: userMarketPositionData?.LEND?.underlyingTokenBalance.amountUsdc ?? '0',
        },
        BORROW: {
          userDeposited: userMarketPositionData?.BORROW?.underlyingTokenBalance.amount ?? '0',
          userDepositedUsdc: userMarketPositionData?.BORROW?.underlyingTokenBalance.amountUsdc ?? '0',
        },
        token: {
          address: tokenData?.address,
          name: tokenData?.name,
          symbol: tokenData?.symbol,
          decimals: parseInt(tokenData?.decimals),
          icon: tokenData?.icon,
          balance: userTokenData?.balance ?? '0',
          balanceUsdc: userTokenData?.balanceUsdc ?? '0',
          priceUsdc: tokenData?.priceUsdc ?? '0',
          allowancesMap: tokenAllowancesMap,
        },
      };
    });
    return markets;
  }
);

const selectLendMarkets = createSelector([selectMarkets], (markets): IronBankMarketView[] => {
  const lendMarkets = markets.map(({ BORROW, LEND, token, ...rest }) => ({ token, ...LEND, ...rest }));
  return lendMarkets.filter((market) => new BigNumber(market.userDeposited).gt(0));
});

const selectBorrowMarkets = createSelector([selectMarkets], (markets) => {
  const borrowMarkets = markets.map(({ BORROW, LEND, token, ...rest }) => ({ token, ...BORROW, ...rest }));
  return borrowMarkets.filter((market) => new BigNumber(market.userDeposited).gt(0));
});

const selectSummaryData = createSelector(
  [selectLendMarkets, selectBorrowMarkets, selectIronBankData],
  (lendMarkets, borrowMarkets, ironBankData) => {
    let totalSupply: BigNumber = new BigNumber('0');
    let totalBorrow: BigNumber = new BigNumber('0');
    lendMarkets.forEach((lendMarket) => (totalSupply = totalSupply.plus(lendMarket.userDepositedUsdc)));
    borrowMarkets.forEach((borrowMarket) => (totalBorrow = totalBorrow.plus(borrowMarket.userDepositedUsdc)));

    return {
      supplyBalance: totalSupply.toString(),
      borrowBalance: totalBorrow.toString(),
      borrowUtilizationRatio: ironBankData?.utilizationRatioBips ?? '0',
      // TODO: Calc for NET APY
      netAPY: '0',
    };
  }
);

const selectIronBankStatus = createSelector(
  [
    selectGetIronBankDataStatus,
    selectGetMarketsStatus,
    selectGetUserMarketsPositionsStatus,
    selectGetUserMarketsMetadataStatus,
  ],
  (getIronBankDataStatis, getMarketsStatus, getUserMarketsPositionsStatus, getUserMarketsMetadataStatus): Status => {
    return {
      loading:
        getIronBankDataStatis.loading ||
        getMarketsStatus.loading ||
        getUserMarketsPositionsStatus.loading ||
        getUserMarketsMetadataStatus.loading,
      error:
        getIronBankDataStatis.error ||
        getMarketsStatus.error ||
        getUserMarketsPositionsStatus.error ||
        getUserMarketsMetadataStatus.error,
    };
  }
);

export const IronBankSelectors = {
  selectMarkets,
  selectIronBankData,
  selectLendMarkets,
  selectBorrowMarkets,
  selectSummaryData,
  selectIronBankStatus,
};
