import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, ThunkAPI } from '@frameworks/redux';
import { getEthersProvider } from '@frameworks/ethers';
import { Theme, RootState, DIContainer, Subscriptions } from '@types';

export const WalletActions = {
  walletChange: createAction<{ walletName: string }>('wallet/walletChange'),
  addressChange: createAction<{ address: string }>('wallet/addressChange'),
  networkChange: createAction<{ network: number }>('wallet/networkChange'),
  balanceChange: createAction<{ balance: string }>('wallet/balanceChange'),

  getSubscriptions: (dispatch: AppDispatch, customSubscriptions?: Subscriptions) => ({
    wallet: (wallet: any) => {
      dispatch(WalletActions.walletChange({ walletName: wallet.name }));
      if (customSubscriptions && customSubscriptions.wallet) customSubscriptions.wallet(wallet);
    },
    address: (address: string) => {
      dispatch(WalletActions.addressChange({ address }));
      if (customSubscriptions && customSubscriptions.address) customSubscriptions.address(address);
    },
    network: (network: number) => {
      dispatch(WalletActions.networkChange({ network }));
      if (customSubscriptions && customSubscriptions.network) customSubscriptions.network(network);
    },
    balance: (balance: string) => {
      dispatch(WalletActions.balanceChange({ balance }));
      if (customSubscriptions && customSubscriptions.balance) customSubscriptions.balance(balance);
    },
  }),

  walletSelect: createAsyncThunk<{ isConnected: boolean }, string | undefined, ThunkAPI>(
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
        const subscriptions = WalletActions.getSubscriptions(dispatch, customSubscriptions);
        wallet.create(ETHEREUM_NETWORK, subscriptions, theme.current);
      }
      const isConnected = await wallet.connect({ name: walletName });
      return { isConnected };
    }
  ),

  changeWalletTheme: (theme: Theme) => async (
    dispatch: AppDispatch,
    getState: () => RootState,
    container: DIContainer
  ) => {
    const { wallet } = container.context;
    if (wallet.isCreated && wallet.changeTheme) {
      wallet.changeTheme(theme);
    }
  },
};
