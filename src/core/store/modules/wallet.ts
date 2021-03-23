import { Dispatch, AnyAction } from 'redux';

import { BlocknativeWalletImpl } from '@frameworks/blocknative';
import { getConfig } from '@config';
import { RootState, WalletState, Wallet, Subscriptions, Theme } from '@types';

export const WALLET_CREATE = 'wallet/walletCreate';
export const WALLET_SELECT_REQUEST = 'wallet/walletSelect/pending';
export const WALLET_SELECT_SUCCESS = 'wallet/walletSelect/fulfilled';
export const WALLET_SELECT_FAILED = 'wallet/walletSelect/rejected';
export const WALLET_CHANGE = 'wallet/walletChange';
export const ADDRESS_CHANGE = 'wallet/addressChange';
export const NETWORK_CHANGE = 'wallet/networkChange';
export const BALANCE_CHANGE = 'wallet/balanceChange';

export let wallet: Wallet;

const getSubscriptions = (
  dispatch: Dispatch<AnyAction>,
  customSubscriptions?: Subscriptions
) => ({
  wallet: (wallet: any) => {
    dispatch({ type: WALLET_CHANGE, payload: wallet.name });
    if (customSubscriptions && customSubscriptions.wallet)
      customSubscriptions.wallet(wallet);
  },
  address: (address: string) => {
    dispatch({ type: ADDRESS_CHANGE, payload: address });
    if (customSubscriptions && customSubscriptions.address)
      customSubscriptions.address(address);
  },
  network: (network: number) => {
    dispatch({ type: NETWORK_CHANGE, payload: network });
    if (customSubscriptions && customSubscriptions.network)
      customSubscriptions.network(network);
  },
  balance: (balance: string) => {
    dispatch({ type: BALANCE_CHANGE, payload: balance });
    if (customSubscriptions && customSubscriptions.balance)
      customSubscriptions.balance(balance);
  },
});

export const walletSelect = (
  walletName?: string,
  customSubscriptions?: Subscriptions
) => async (dispatch: Dispatch<AnyAction>, getState: () => RootState) => {
  const { ETHEREUM_NETWORK } = getConfig();
  const { theme } = getState();

  if (!wallet) {
    wallet = new BlocknativeWalletImpl();
    const subscriptions = getSubscriptions(dispatch, customSubscriptions);
    wallet.create(ETHEREUM_NETWORK, subscriptions, theme.current);
    dispatch({
      type: WALLET_CREATE,
    });
  }

  dispatch({ type: WALLET_SELECT_REQUEST });
  try {
    const isConnected = await wallet.connect({ name: walletName });
    dispatch({ type: WALLET_SELECT_SUCCESS, payload: { isConnected } });
  } catch (error) {
    dispatch({ type: WALLET_SELECT_FAILED, error });
  }
};

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

export const walletReducer = (
  state = initialState,
  action: AnyAction
): WalletState => {
  const { type, payload, error } = action;
  switch (type) {
    case WALLET_CREATE:
      return {
        ...initialState,
      };
    case WALLET_SELECT_REQUEST:
      return {
        ...state,
        isLoading: true,
        error,
      };
    case WALLET_SELECT_SUCCESS:
      return {
        ...state,
        isConnected: payload.isConnected || state.isConnected,
        isLoading: false,
        error,
      };
    case WALLET_SELECT_FAILED:
      return {
        ...state,
        isLoading: false,
        error,
      };
    case WALLET_CHANGE:
      return {
        ...state,
        name: payload,
      };
    case ADDRESS_CHANGE:
      return {
        ...state,
        selectedAddress: payload,
      };
    case NETWORK_CHANGE:
      return {
        ...state,
        networkVersion: payload,
      };
    case BALANCE_CHANGE:
      return {
        ...state,
        balance: payload,
      };
    default:
      return state;
  }
};
