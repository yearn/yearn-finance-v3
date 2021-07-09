import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import { WalletActions } from '@store';
import { isValidAddress } from '@utils';

const toggleSidebar = createAction('settings/toggleSidebar');
const closeSidebar = createAction('settings/closeSidebar');

const setDefaultSlippage = createAsyncThunk<{ slippage: number }, { slippage: number }, ThunkAPI>(
  'settings/setDefaultSlippage',
  async ({ slippage }, { getState }) => {
    const availableSlippages = getState().settings.availableSlippages;
    if (!availableSlippages.find((s) => s === slippage)) {
      throw new Error('SLIPPAGE NOT IN AVAILABLE SLIPPAGES');
    }

    return { slippage };
  }
);

const toggleDevMode = createAsyncThunk<{ enable: boolean }, { enable: boolean }, ThunkAPI>(
  'settings/toggleDevMode',
  async ({ enable }, { dispatch, extra }) => {
    const { config, context } = extra;
    const { ALLOW_DEV_MODE } = config;

    if (ALLOW_DEV_MODE && !enable && context.wallet.isConnected && context.wallet.selectedAddress) {
      dispatch(WalletActions.addressChange({ address: context.wallet.selectedAddress }));
    }

    return { enable };
  }
);

const changeWalletAddressOverride = createAsyncThunk<void, { address: string }, ThunkAPI>(
  'settings/changeWalletAddressOverride',
  async ({ address }, { dispatch, getState, extra }) => {
    const { config } = extra;
    const { ALLOW_DEV_MODE } = config;
    const { settings } = getState();

    if (ALLOW_DEV_MODE && settings.devMode.enabled && isValidAddress(address)) {
      dispatch(WalletActions.addressChange({ address }));
    }
  }
);

export const SettingsActions = {
  toggleSidebar,
  closeSidebar,
  setDefaultSlippage,
  toggleDevMode,
  changeWalletAddressOverride,
};
