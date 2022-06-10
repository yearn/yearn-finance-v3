import { createReducer } from '@reduxjs/toolkit';

import { initialStatus, VotingEscrowsState } from '@types';

export const votingEscrowsInitialState: VotingEscrowsState = {
  votingEscrowsAddresses: [],
  votingEscrowsMap: {},
  selectedvotingEscrowAddress: undefined,
  user: {
    userVotingEscrowsPositionsMap: {},
  },
  statusMap: {
    initiateVotingEscrows: initialStatus,
    getVotingEscrows: initialStatus,
    user: {
      getUserVotingEscrowsPositions: initialStatus,
    },
  },
};

const votingEscrowsReducer = createReducer(votingEscrowsInitialState, (builder) => {});

export default votingEscrowsReducer;
