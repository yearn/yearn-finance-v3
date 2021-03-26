import { createReducer } from '@reduxjs/toolkit';
import { WalletState } from '@types';
import {
  addressChange,
  balanceChange,
  networkChange,
  walletChange,
  walletSelect,
} from './wallet.actions';

const initialState: WalletState = {
  selectedAddress: undefined,
  networkVersion: undefined,
  balance: undefined,
  name: undefined,
  isConnected: false,
  isLoading: false,
  error: undefined,
};

const walletReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(walletChange, (state, { payload: { walletName } }) => {
      state.name = walletName;
    })
    .addCase(addressChange, (state, { payload: { address } }) => {
      state.selectedAddress = address;
    })
    .addCase(networkChange, (state, { payload: { network } }) => {
      state.networkVersion = network;
    })
    .addCase(balanceChange, (state, { payload: { balance } }) => {
      state.balance = balance;
    })
    .addCase(walletSelect.pending, (state) => {
      state.isLoading = true;
      state.error = undefined;
    })
    .addCase(walletSelect.fulfilled, (state, { payload: { isConnected } }) => {
      state.isConnected = isConnected;
      state.isLoading = false;
    })
    .addCase(walletSelect.rejected, (state, { error }) => {
      state.isLoading = false;
      state.error = error.message;
    });
});

export default walletReducer;
