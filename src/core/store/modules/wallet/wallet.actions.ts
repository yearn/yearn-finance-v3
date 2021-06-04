import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, ThunkAPI } from '@frameworks/redux';
import { getEthersProvider } from '@frameworks/ethers';
import { Theme, RootState, DIContainer, Subscriptions } from '@types';
import { isValidAddress } from '@utils';

const walletChange = createAction<{ walletName: string }>('wallet/walletChange');
const addressChange = createAction<{ address: string }>('wallet/addressChange');
const networkChange = createAction<{ network: number }>('wallet/networkChange');
const balanceChange = createAction<{ balance: string }>('wallet/balanceChange');

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

const walletSelect = createAsyncThunk<{ isConnected: boolean }, string | undefined, ThunkAPI>(
  'wallet/walletSelect',
  async (walletName, { dispatch, getState, extra }) => {
    const { context, config } = extra;
    const { wallet, web3Provider } = context;
    const { ETHEREUM_NETWORK, ALLOW_DEV_MODE } = config;
    const { theme, settings } = getState();

    if (!wallet.isCreated) {
      const customSubscriptions: Subscriptions = {
        wallet: (wallet) => web3Provider.register('wallet', getEthersProvider(wallet.provider)),
        address: () => {
          if (ALLOW_DEV_MODE && settings.devMode.enabled && isValidAddress(settings.devMode.walletAddressOverride)) {
            dispatch(addressChange({ address: settings.devMode.walletAddressOverride }));
          }
        },
      };
      const subscriptions = getSubscriptions(dispatch, customSubscriptions);
      wallet.create(ETHEREUM_NETWORK, subscriptions, theme.current);
    }
    const isConnected = await wallet.connect({ name: walletName });
    return { isConnected };
  }
);

const changeWalletTheme = (theme: Theme) => async (
  dispatch: AppDispatch,
  getState: () => RootState,
  container: DIContainer
) => {
  const { wallet } = container.context;
  if (wallet.isCreated && wallet.changeTheme) {
    wallet.changeTheme(theme);
  }
};

export const WalletActions = {
  walletChange,
  addressChange,
  networkChange,
  balanceChange,
  walletSelect,
  changeWalletTheme,
};
