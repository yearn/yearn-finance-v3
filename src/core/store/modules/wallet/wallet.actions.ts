import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, ThunkAPI } from '../../../frameworks/redux';
import { Theme, RootState, DIContainer } from '@types';

export const walletChange = createAction<{ walletName: string }>('wallet/walletChange');
export const addressChange = createAction<{ address: string }>('wallet/addressChange');
export const networkChange = createAction<{ network: number }>('wallet/networkChange');
export const balanceChange = createAction<{ balance: string }>('wallet/balanceChange');

const getSubscriptions = (dispatch: AppDispatch) => ({
  wallet: (wallet: any) => dispatch(walletChange({ walletName: wallet.name })),
  address: (address: string) => dispatch(addressChange({ address })),
  network: (network: number) => dispatch(networkChange({ network })),
  balance: (balance: string) => dispatch(balanceChange({ balance })),
});

export const walletSelect = createAsyncThunk<{ isConnected: boolean }, string | undefined, ThunkAPI>(
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
    return { isConnected };
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
