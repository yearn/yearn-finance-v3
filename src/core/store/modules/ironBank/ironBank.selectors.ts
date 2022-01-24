import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

import {
  RootState,
  IronBankMarketView,
  MarketActionsStatusMap,
  Status,
  Address,
  IronBankMarket,
  CyTokenUserMetadata,
  IronBankMarketPositionsMap,
  AllowancesMap,
  Token,
  Balance,
  GeneralIronBankMarketView,
} from '@types';
import { toBN } from '@utils';

import { createToken } from '../tokens/tokens.selectors';

import { initialMarketsActionsMap } from './ironBank.reducer';

const selectMarketsMap = (state: RootState) => state.ironBank.marketsMap;
const selectMarketsAddresses = (state: RootState) => state.ironBank.marketAddresses;
const selectSelectedMarketAddress = (state: RootState) => state.ironBank.selectedMarketAddress;
const selectMarketsAllowancesMap = (state: RootState) => state.ironBank.user.marketsAllowancesMap;
const selectUserMarketsPositionsMap = (state: RootState) => state.ironBank.user.userMarketsPositionsMap;
const selectUserMarketsMetadataMap = (state: RootState) => state.ironBank.user.userMarketsMetadataMap;
const selectUserIronBankSummary = (state: RootState) => state.ironBank.user.userIronBankSummary;

const selectGetUserIronBankSummaryStatus = (state: RootState) => state.ironBank.statusMap.user.getUserIronBankSummary;
const selectGetMarketsStatus = (state: RootState) => state.ironBank.statusMap.getMarkets;
const selectGetUserMarketsPositionsStatus = (state: RootState) => state.ironBank.statusMap.user.getUserMarketsPositions;
const selectGetUserMarketsMetadataStatus = (state: RootState) => state.ironBank.statusMap.user.getUserMarketsMetadata;
const selectMarketsActionsStatusMap = (state: RootState) => state.ironBank.statusMap.marketsActionsMap;

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
    selectUserIronBankSummary,
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
    userIronBankSummary
  ) => {
    const markets = marketAddresses.map((address) => {
      const marketData = marketsMap[address];
      const userMarketPositionData = userMarketsPositionsMap[address];
      const userMarketMetadata = userMarketsMetadataMap[address];
      const tokenData = tokensMap[marketData.tokenId];
      const userTokenData = userTokensMap[marketData.tokenId];
      const tokenAllowancesMap = userTokensAllowancesMap[marketData.tokenId] ?? {};
      const marketAllowancesMap = marketsAllowancesMap[address] ?? {};
      return createMarket({
        marketData,
        userMarketPositionData,
        userMarketMetadata,
        marketAllowancesMap,
        tokenData,
        userTokenData,
        tokenAllowancesMap,
      });
    });

    markets.sort((a, b) => {
      return toBN(b.token.balance).minus(a.token.balance).toNumber();
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

const selectSelectedMarket = createSelector(
  [selectMarkets, selectSelectedMarketAddress],
  (markets, selectedMarketAddress) => {
    if (!selectedMarketAddress) return undefined;

    return markets.find((market) => market.address === selectedMarketAddress);
  }
);

const selectSelectedMarketActionsStatusMap = createSelector(
  [selectMarketsActionsStatusMap, selectSelectedMarketAddress],
  (marketsActionsStatusMap, selectedMarketAddress): MarketActionsStatusMap => {
    return selectedMarketAddress ? marketsActionsStatusMap[selectedMarketAddress] : initialMarketsActionsMap;
  }
);

const selectSummaryData = createSelector([selectUserIronBankSummary], (userIronBankSummary) => {
  return {
    supplyBalanceUsdc: userIronBankSummary?.supplyBalanceUsdc ?? '0',
    borrowBalanceUsdc: userIronBankSummary?.borrowBalanceUsdc ?? '0',
    borrowUtilizationRatio: userIronBankSummary?.utilizationRatioBips ?? '0',
    // TODO: Calc for NET APY
    borrowLimitUsdc: userIronBankSummary?.borrowLimitUsdc ?? '0',
  };
});

const selectRecommendations = createSelector([selectMarkets], (markets) => {
  const sortedMarkets = [...markets].sort((a, b) => {
    return toBN(b.lendApy).minus(a.lendApy).toNumber();
  });
  return sortedMarkets.slice(0, 3);
});

const selectIronBankStatus = createSelector(
  [
    selectGetUserIronBankSummaryStatus,
    selectGetMarketsStatus,
    selectGetUserMarketsPositionsStatus,
    selectGetUserMarketsMetadataStatus,
  ],
  (
    getUserIronBankSummaryStatus,
    getMarketsStatus,
    getUserMarketsPositionsStatus,
    getUserMarketsMetadataStatus
  ): Status => {
    return {
      loading:
        getUserIronBankSummaryStatus.loading ||
        getMarketsStatus.loading ||
        getUserMarketsPositionsStatus.loading ||
        getUserMarketsMetadataStatus.loading,
      error:
        getUserIronBankSummaryStatus.error ||
        getMarketsStatus.error ||
        getUserMarketsPositionsStatus.error ||
        getUserMarketsMetadataStatus.error,
    };
  }
);

const selectUnderlyingTokensAddresses = createSelector([selectMarketsMap], (markets): Address[] => {
  return Object.values(markets).map((market) => market.tokenId);
});

interface CreateMarketProps {
  marketData: IronBankMarket;
  userMarketMetadata: CyTokenUserMetadata;
  userMarketPositionData: IronBankMarketPositionsMap;
  marketAllowancesMap: AllowancesMap;
  tokenData: Token;
  userTokenData: Balance;
  tokenAllowancesMap: AllowancesMap;
}

function createMarket(props: CreateMarketProps): GeneralIronBankMarketView {
  const {
    marketData,
    userMarketPositionData,
    userMarketMetadata,
    marketAllowancesMap,
    tokenData,
    userTokenData,
    tokenAllowancesMap,
  } = props;
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
    allowancesMap: marketAllowancesMap ?? {},
    enteredMarket: userMarketMetadata?.enteredMarket ?? false,
    LEND: {
      userBalance: userMarketPositionData?.LEND?.balance ?? '0',
      userDeposited: userMarketPositionData?.LEND?.underlyingTokenBalance.amount ?? '0',
      userDepositedUsdc: userMarketPositionData?.LEND?.underlyingTokenBalance.amountUsdc ?? '0',
    },
    BORROW: {
      userBalance: userMarketPositionData?.BORROW?.balance ?? '0',
      userDeposited: userMarketPositionData?.BORROW?.underlyingTokenBalance.amount ?? '0',
      userDepositedUsdc: userMarketPositionData?.BORROW?.underlyingTokenBalance.amountUsdc ?? '0',
    },
    token: createToken({ tokenData, userTokenData, allowancesMap: tokenAllowancesMap }),
  };
}

export const IronBankSelectors = {
  selectMarkets,
  selectUserIronBankSummary,
  selectLendMarkets,
  selectBorrowMarkets,
  selectSelectedMarket,
  selectSelectedMarketActionsStatusMap,
  selectSummaryData,
  selectRecommendations,
  selectIronBankStatus,
  selectUnderlyingTokensAddresses,
};
