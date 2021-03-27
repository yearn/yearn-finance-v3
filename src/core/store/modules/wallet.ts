import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI, AppDispatch } from '@frameworks/redux';
import { WalletState, Theme, RootState, DIContainer } from '@types';

const getSubscriptions = (dispatch: AppDispatch) => ({
  wallet: (wallet: any) => dispatch(walletChange(wallet.name)),
  address: (address: string) => dispatch(addressChange(address)),
  network: (network: number) => dispatch(networkChange(network)),
  balance: (balance: string) => dispatch(balanceChange(balance)),
});

export const walletSelect = createAsyncThunk<boolean, string | undefined, ThunkAPI>(
  'wallet/walletSelect',
  async (walletName, { dispatch, getState, extra }) => {
    const { context, config } = extra;
    const { wallet } = context;
    const { ETHEREUM_NETWORK } = config;
    const { theme } = getState();

    if (!wallet.isCreated) {
      const subscriptions = getSubscriptions(dispatch);
      wallet.create(ETHEREUM_NETWORK, subscriptions, theme.current);
    }

    const isConnected = await wallet.connect({ name: walletName });
    return isConnected;
  }
);

export const changeWalletTheme = (theme: Theme) => async (
  dispatch: AppDispatch,
  getState: () => RootState,
  container: DIContainer
) => {
  const { wallet } = container.context;
  if (wallet.isCreated && wallet.changeTheme) {
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

export const { walletChange, addressChange, networkChange, balanceChange } = walletSlice.actions;
export default walletSlice.reducer;
