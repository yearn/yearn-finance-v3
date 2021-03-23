import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import { BlocknativeWalletImpl } from '@frameworks/blocknative';
import { ThunkAPI, AppDispatch } from '@frameworks/redux';
import { getConfig } from '@config';
import { WalletState, Wallet, Theme } from '@types';

export let wallet: Wallet;

const getSubscriptions = (dispatch: AppDispatch) => ({
  wallet: (wallet: any) => dispatch(walletChange(wallet.name)),
  address: (address: string) => dispatch(addressChange(address)),
  network: (network: number) => dispatch(networkChange(network)),
  balance: (balance: string) => dispatch(balanceChange(balance)),
});

export const walletSelect = createAsyncThunk<
  boolean,
  string | undefined,
  ThunkAPI
>('wallet/walletSelect', async (walletName, { dispatch, getState }) => {
  const { ETHEREUM_NETWORK } = getConfig();
  const { theme } = getState();

  if (!wallet) {
    wallet = new BlocknativeWalletImpl();
    const subscriptions = getSubscriptions(dispatch);
    wallet.create(ETHEREUM_NETWORK, subscriptions, theme.current);
  }

  const isConnected = await wallet.connect({ name: walletName });
  return isConnected;
});

export const changeWalletTheme = (theme: Theme) => async () => {
  if (wallet && wallet.changeTheme) {
    wallet.changeTheme(theme);
  }
};

const initialState: WalletState = {
  selectedAddress: undefined,
  networkVersion: undefined,
  balance: undefined,
  name: undefined,
  isConnected: false,
  isLoading: false,
  error: undefined,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    walletChange(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    addressChange(state, action: PayloadAction<string>) {
      state.selectedAddress = action.payload;
    },
    networkChange(state, action: PayloadAction<number>) {
      state.networkVersion = action.payload;
    },
    balanceChange(state, action: PayloadAction<string>) {
      state.balance = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(walletSelect.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(walletSelect.fulfilled, (state, action) => {
        state.isConnected = action.payload;
        state.isLoading = false;
      })
      .addCase(walletSelect.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  walletChange,
  addressChange,
  networkChange,
  balanceChange,
} = walletSlice.actions;
export default walletSlice.reducer;
