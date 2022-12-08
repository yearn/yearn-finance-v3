import { createReducer } from '@reduxjs/toolkit';
import { keyBy, union } from 'lodash';

import { initialStatus, VotingEscrowPositionsMap, VotingEscrowsState } from '@types';

import { VotingEscrowsActions } from './votingEscrows.actions';

export const votingEscrowsInitialState: VotingEscrowsState = {
  votingEscrowsAddresses: [],
  votingEscrowsMap: {},
  selectedvotingEscrowAddress: undefined,
  user: {
    userVotingEscrowsPositionsMap: {},
    userVotingEscrowsMetadataMap: {},
  },
  statusMap: {
    initiateVotingEscrows: initialStatus,
    getVotingEscrows: initialStatus,
    user: {
      getUserVotingEscrowsPositions: initialStatus,
      getUserVotingEscrowsMetadata: initialStatus,
    },
  },
};

const {
  setSelectedVotingEscrowAddress,
  clearVotingEscrowsData,
  clearUserData,
  clearSelectedVotingEscrow,
  initiateVotingEscrows,
  getVotingEscrows,
  getVotingEscrowsDynamic,
  getUserVotingEscrowsPositions,
  getUserVotingEscrowsMetadata,
} = VotingEscrowsActions;

const votingEscrowsReducer = createReducer(votingEscrowsInitialState, (builder) => {
  builder

    /* -------------------------------------------------------------------------- */
    /*                                   Setters                                  */
    /* -------------------------------------------------------------------------- */
    .addCase(setSelectedVotingEscrowAddress, (state, { payload: { votingEscrowAddress } }) => {
      state.selectedvotingEscrowAddress = votingEscrowAddress;
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Clear State                                */
    /* -------------------------------------------------------------------------- */
    .addCase(clearVotingEscrowsData, (state) => {
      state.votingEscrowsMap = {};
      state.votingEscrowsAddresses = [];
    })

    .addCase(clearUserData, (state) => {
      state.user.userVotingEscrowsPositionsMap = {};
    })

    .addCase(clearSelectedVotingEscrow, (state) => {
      state.selectedvotingEscrowAddress = undefined;
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Fetch data                                 */
    /* -------------------------------------------------------------------------- */

    /* -------------------------- initiateVotingEscrows ------------------------- */
    .addCase(initiateVotingEscrows.pending, (state) => {
      state.statusMap.initiateVotingEscrows = { loading: true };
    })
    .addCase(initiateVotingEscrows.fulfilled, (state) => {
      state.statusMap.initiateVotingEscrows = {};
    })
    .addCase(initiateVotingEscrows.rejected, (state, { error }) => {
      state.statusMap.initiateVotingEscrows = { error: error.message };
    })

    /* ---------------------------- getVotingEscrows ---------------------------- */
    .addCase(getVotingEscrows.pending, (state) => {
      state.statusMap.getVotingEscrows = { loading: true };
    })
    .addCase(getVotingEscrows.fulfilled, (state, { payload: { votingEscrows } }) => {
      const votingEscrowsAddresses = votingEscrows.map(({ address }) => address);
      const votingEscrowsMap = keyBy(votingEscrows, 'address');
      state.votingEscrowsAddresses = union(state.votingEscrowsAddresses, votingEscrowsAddresses);
      state.votingEscrowsMap = { ...state.votingEscrowsMap, ...votingEscrowsMap };
      state.statusMap.getVotingEscrows = {};
    })
    .addCase(getVotingEscrows.rejected, (state, { error }) => {
      state.statusMap.getVotingEscrows = { error: error.message };
    })

    /* ------------------------- getVotingEscrowsDynamic ------------------------ */
    .addCase(getVotingEscrowsDynamic.fulfilled, (state, { payload: { votingEscrowsDynamic } }) => {
      votingEscrowsDynamic.forEach((datum) => {
        const { address } = datum;
        state.votingEscrowsMap[address] = { ...state.votingEscrowsMap[address], ...datum };
      });
    })

    /* ---------------------- getUserVotingEscrowsPositions --------------------- */
    .addCase(getUserVotingEscrowsPositions.pending, (state) => {
      state.statusMap.user.getUserVotingEscrowsPositions = { loading: true };
    })
    .addCase(getUserVotingEscrowsPositions.fulfilled, (state, { meta, payload: { positions } }) => {
      const requestedAddresses = meta.arg.addresses || [];
      if (!requestedAddresses.length) state.user.userVotingEscrowsPositionsMap = {};
      const positionsMap = positions.reduce((map, position) => {
        if (!map[position.assetAddress]) map[position.assetAddress] = {};
        map[position.assetAddress][position.typeId as keyof VotingEscrowPositionsMap] = position;
        return map;
      }, {} as Record<string, VotingEscrowPositionsMap>);
      requestedAddresses.forEach((address) => {
        state.user.userVotingEscrowsPositionsMap[address] = positionsMap[address] ?? {};
      });
      state.user.userVotingEscrowsPositionsMap = { ...state.user.userVotingEscrowsPositionsMap, ...positionsMap };
      if (!requestedAddresses.length && !positions.length) {
        state.user.userVotingEscrowsPositionsMap = {};
      }

      state.statusMap.user.getUserVotingEscrowsPositions = {};
    })
    .addCase(getUserVotingEscrowsPositions.rejected, (state, { error }) => {
      state.statusMap.user.getUserVotingEscrowsPositions = { error: error.message };
    })

    /* ---------------------- getUserVotingEscrowsMetadata ---------------------- */
    .addCase(getUserVotingEscrowsMetadata.pending, (state) => {
      state.statusMap.user.getUserVotingEscrowsMetadata = { loading: true };
    })
    .addCase(getUserVotingEscrowsMetadata.fulfilled, (state, { payload: { userVotingEscrowsMetadata } }) => {
      const userVotingEscrowsMetadataMap = keyBy(userVotingEscrowsMetadata, 'assetAddress');
      state.user.userVotingEscrowsMetadataMap = {
        ...state.user.userVotingEscrowsMetadataMap,
        ...userVotingEscrowsMetadataMap,
      };
      state.statusMap.user.getUserVotingEscrowsMetadata = {};
    })
    .addCase(getUserVotingEscrowsMetadata.rejected, (state, { error }) => {
      state.statusMap.user.getUserVotingEscrowsMetadata = { error: error.message };
    });
});

export default votingEscrowsReducer;
