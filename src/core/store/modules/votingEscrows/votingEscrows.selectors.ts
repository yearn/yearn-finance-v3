import { createSelector } from '@reduxjs/toolkit';

import {
  RootState,
  TokenView,
  VotingEscrow,
  VotingEscrowPositionsMap,
  VotingEscrowUserMetadata,
  VotingEscrowView,
} from '@types';

import { TokensSelectors, createToken } from '../tokens/tokens.selectors';

/* ---------------------------------- State --------------------------------- */
const selectVotingEscrowsState = (state: RootState) => state.votingEscrows;
const selectVotingEscrowsAddresses = (state: RootState) => state.votingEscrows.votingEscrowsAddresses;
const selectVotingEscrowsMap = (state: RootState) => state.votingEscrows.votingEscrowsMap;
const selectSelectedVotingEscrowAddress = (state: RootState) => state.votingEscrows.selectedvotingEscrowAddress;
const selectUserVotingEscrowsPositionsMap = (state: RootState) =>
  state.votingEscrows.user.userVotingEscrowsPositionsMap;
const selectUserVotingEscrowsMetadataMap = (state: RootState) => state.votingEscrows.user.userVotingEscrowsMetadataMap;
const selectVotingEscrowsStatusMap = (state: RootState) => state.votingEscrows.statusMap;

/* ----------------------------- Main Selectors ----------------------------- */
const selectVotingEscrows = createSelector(
  [
    selectVotingEscrowsAddresses,
    selectVotingEscrowsMap,
    selectUserVotingEscrowsPositionsMap,
    selectUserVotingEscrowsMetadataMap,
    TokensSelectors.selectTokensMap,
    TokensSelectors.selectUserTokensMap,
    TokensSelectors.selectUserTokensAllowancesMap,
  ],
  (
    votingEscrowsAddresses,
    votingEscrowsMap,
    userVotingEscrowsPositionsMap,
    userVotingEscrowsMetadataMap,
    tokensMap,
    userTokensMap,
    userTokensAllowancesMap
  ): VotingEscrowView[] => {
    const votingEscrowsViews = votingEscrowsAddresses.map((address) => {
      const votingEscrow = votingEscrowsMap[address];
      const userVotingEscrowPositionsMap = userVotingEscrowsPositionsMap[address];
      const userVotingEscrowMetadata = userVotingEscrowsMetadataMap[address];
      const token = tokensMap[votingEscrow.token];
      const userToken = userTokensMap[votingEscrow.token];
      const tokenAllowancesMap = userTokensAllowancesMap[votingEscrow.token];
      const tokenView = createToken({ tokenData: token, userTokenData: userToken, allowancesMap: tokenAllowancesMap });
      return createVotingEscrowView({
        votingEscrow,
        tokenView,
        userVotingEscrowPositionsMap,
        userVotingEscrowMetadata,
      });
    });

    return votingEscrowsViews;
  }
);

const selectSelectedVotingEscrow = createSelector(
  [selectSelectedVotingEscrowAddress, selectVotingEscrows],
  (selectedVotingEscrowAddress, votingEscrows) => {
    if (!selectedVotingEscrowAddress) return undefined;

    return votingEscrows.find(({ address }) => address === selectedVotingEscrowAddress);
  }
);

/* --------------------------------- Helper --------------------------------- */
interface CreateVotingEscrowProps {
  votingEscrow: VotingEscrow;
  tokenView: TokenView;
  userVotingEscrowPositionsMap: VotingEscrowPositionsMap;
  userVotingEscrowMetadata?: VotingEscrowUserMetadata;
}

function createVotingEscrowView({
  votingEscrow,
  tokenView,
  userVotingEscrowPositionsMap,
  userVotingEscrowMetadata,
}: CreateVotingEscrowProps): VotingEscrowView {
  return {
    address: votingEscrow.address,
    name: votingEscrow.name,
    symbol: votingEscrow.symbol,
    decimals: parseInt(votingEscrow.decimals),
    balance: votingEscrow.underlyingTokenBalance.amount,
    balanceUsdc: votingEscrow.underlyingTokenBalance.amountUsdc,
    unlockDate: userVotingEscrowMetadata?.unlockDate,
    earlyExitPenaltyRatio: userVotingEscrowMetadata?.earlyExitPenaltyRatio,
    token: tokenView,
    DEPOSIT: {
      userBalance: userVotingEscrowPositionsMap?.DEPOSIT?.balance ?? '0',
      userDeposited: userVotingEscrowPositionsMap?.DEPOSIT?.underlyingTokenBalance.amount ?? '0',
      userDepositedUsdc: userVotingEscrowPositionsMap?.DEPOSIT?.underlyingTokenBalance.amountUsdc ?? '0',
    },
  };
}

export const VotingEscrowsSelectors = {
  selectVotingEscrowsState,
  selectVotingEscrowsAddresses,
  selectVotingEscrowsMap,
  selectSelectedVotingEscrowAddress,
  selectUserVotingEscrowsPositionsMap,
  selectUserVotingEscrowsMetadataMap,
  selectVotingEscrowsStatusMap,
  selectVotingEscrows,
  selectSelectedVotingEscrow,
};
