import { createReducer } from '@reduxjs/toolkit';
import { getAddress } from '@ethersproject/address';

import { WalletState } from '@types';

import { WalletActions } from './wallet.actions';

export const walletInitialState: WalletState = {
  selectedAddress: undefined,
  addressEnsName: undefined,
  networkVersion: undefined,
  name: undefined,
  isConnected: false,
  isLoading: false,
  error: undefined,
};

const { addressChange, networkChange, walletChange, ensChange, walletSelect, getAddressEnsName } = WalletActions;

const walletReducer = createReducer(walletInitialState, (builder) => {
  builder
    .addCase(walletChange, (state, { payload: { walletName } }) => {
      state.name = walletName;
    })
    .addCase(addressChange, (state, { payload: { address } }) => {
      state.selectedAddress = address ? getAddress(address) : undefined;
    })
    .addCase(networkChange, (state, { payload: { network } }) => {
      state.networkVersion = network;
    })
    .addCase(ensChange, (state, { payload: { ens } }) => {
      state.addressEnsName = ens;
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
    })
    .addCase(getAddressEnsName.fulfilled, (state, { payload: { addressEnsName } }) => {
      state.addressEnsName = addressEnsName;
    });
});

export default walletReducer;
