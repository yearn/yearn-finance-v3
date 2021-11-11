import { createReducer } from '@reduxjs/toolkit';

import { NetworkState } from '@types';
import { getConfig } from '@config';

import { NetworkActions } from './network.actions';

export const networkInitialState: NetworkState = {
  current: getConfig().NETWORK,
};

const { changeNetwork } = NetworkActions;

const networkReducer = createReducer(networkInitialState, (builder) => {
  builder.addCase(changeNetwork.fulfilled, (state, { payload }) => {
    state.current = payload.network;
  });
});

export default networkReducer;
