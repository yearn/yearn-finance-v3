import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, ThunkAPI } from '@frameworks/redux';
import { getEthersProvider } from '@frameworks/ethers';
import { Theme, RootState, DIContainer, Subscriptions } from '@types';

export const walletChange = createAction<{ walletName: string }>('wallet/walletChange');
export const addressChange = createAction<{ address: string }>('wallet/addressChange');
export const networkChange = createAction<{ network: number }>('wallet/networkChange');
export const balanceChange = createAction<{ balance: string }>('wallet/balanceChange');

const getSubscriptions = (dispatch: AppDispatch, customSubscriptions?: Subscriptions) => ({
  wallet: (wallet: any) => {
    dispatch(walletChange({ walletName: wallet.name }));
    if (customSubscriptions && customSubscriptions.wallet) customSubscriptions.wallet(wallet);
  },
  address: (address: string) => {
    dispatch(addressChange({ address }));
    if (customSubscriptions && customSubscriptions.address) customSubscriptions.address(address);
  },
  network: (network: number) => {
    dispatch(networkChange({ network }));
    if (customSubscriptions && customSubscriptions.network) customSubscriptions.network(network);
  },
  balance: (balance: string) => {
    dispatch(balanceChange({ balance }));
    if (customSubscriptions && customSubscriptions.balance) customSubscriptions.balance(balance);
  },
});

export const walletSelect = createAsyncThunk<{ isConnected: boolean }, string | undefined, ThunkAPI>(
  'wallet/walletSelect',
  async (walletName, { dispatch, getState, extra }) => {
    const { context, config } = extra;
    const { wallet, web3Provider } = context;
    const { ETHEREUM_NETWORK } = config;
    const { theme } = getState();

    if (!wallet.isCreated) {
      const customSubscriptions: Subscriptions = {
        wallet: (wallet) => web3Provider.register('wallet', getEthersProvider(wallet.provider)),
      };
      const subscriptions = getSubscriptions(dispatch, customSubscriptions);
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
