import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { AppDispatch, ThunkAPI } from '@frameworks/redux';
import { getEthersProvider, ExternalProvider } from '@frameworks/ethers';
import { Theme, RootState, DIContainer, Subscriptions, Network } from '@types';
import { isValidAddress, getProviderType, getNetwork } from '@utils';

import { NetworkActions } from '../network/network.actions';

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
    if (address) dispatch(getAddressEnsName({ address }));
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

const getAddressEnsName = createAsyncThunk<{ addressEnsName: string }, { address: string }, ThunkAPI>(
  'wallet/getAddressEnsName',
  async ({ address }, { extra }) => {
    const { userService } = extra.services;
    const addressEnsName = await userService.getAddressEnsName({ address });
    return { addressEnsName };
  }
);

interface WalletSelectProps {
  network: Network;
  walletName?: string;
}

const walletSelect = createAsyncThunk<{ isConnected: boolean }, WalletSelectProps, ThunkAPI>(
  'wallet/walletSelect',
  async ({ walletName, network }, { dispatch, getState, extra }) => {
    const { context, config } = extra;
    const { wallet, web3Provider, yearnSdk } = context;
    const { NETWORK, ALLOW_DEV_MODE, SUPPORTED_NETWORKS, NETWORK_SETTINGS } = config;
    const { theme, settings } = getState();

    if (!wallet.isCreated) {
      const customSubscriptions: Subscriptions = {
        wallet: (wallet) => {
          web3Provider.register('wallet', getEthersProvider(wallet.provider));
          const providerType = getProviderType(network);
          const sdkInstance = yearnSdk.getInstanceOf(network);
          sdkInstance.context.setProvider({
            read: web3Provider.getInstanceOf(providerType),
            write: web3Provider.getInstanceOf('wallet'),
          });
        },
        address: () => {
          if (ALLOW_DEV_MODE && settings.devMode.enabled && isValidAddress(settings.devMode.walletAddressOverride)) {
            dispatch(addressChange({ address: settings.devMode.walletAddressOverride }));
            dispatch(getAddressEnsName({ address: settings.devMode.walletAddressOverride }));
          }
        },
        network: (networkId) => {
          const supportedNetworkSettings = SUPPORTED_NETWORKS.find(
            (network) => NETWORK_SETTINGS[network].networkId === networkId
          );
          if (wallet.isConnected) {
            if (supportedNetworkSettings) {
              web3Provider.register('wallet', getEthersProvider(wallet.provider as ExternalProvider));
              const network = getNetwork(networkId);
              const providerType = getProviderType(network);
              const sdkInstance = yearnSdk.getInstanceOf(network);
              sdkInstance.context.setProvider({
                read: web3Provider.getInstanceOf(providerType),
                write: web3Provider.getInstanceOf('wallet'),
              });
              dispatch(NetworkActions.changeNetwork({ network }));
            } else {
              dispatch(NetworkActions.changeNetwork({ network: 'mainnet' }));
            }
          }
        },
      };
      const subscriptions = getSubscriptions(dispatch, customSubscriptions);
      wallet.create(network ?? NETWORK, subscriptions, theme.current);
    }
    const isConnected = await wallet.connect({ name: walletName });
    return { isConnected };
  }
);

const changeWalletTheme =
  (theme: Theme) => async (dispatch: AppDispatch, getState: () => RootState, container: DIContainer) => {
    const { wallet } = container.context;
    if (wallet.isCreated && wallet.changeTheme) {
      wallet.changeTheme(theme);
    }
  };

export interface ChangeWalletNetworkResult {
  networkChanged: boolean;
}

const changeWalletNetwork = createAsyncThunk<ChangeWalletNetworkResult, { network: Network }, ThunkAPI>(
  'wallet/changeWalletNetwork',
  async ({ network }, { extra }) => {
    const { wallet } = extra.context;

    let networkChanged = false;
    if (wallet.isCreated && wallet.changeNetwork) {
      networkChanged = await wallet.changeNetwork(network);
    }

    return { networkChanged };
  }
);

export const WalletActions = {
  walletChange,
  addressChange,
  networkChange,
  balanceChange,
  walletSelect,
  changeWalletTheme,
  changeWalletNetwork,
  getAddressEnsName,
};
