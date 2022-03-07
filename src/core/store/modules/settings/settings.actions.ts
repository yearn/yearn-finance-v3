import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { WalletActions } from '@store';
import { isValidAddress } from '@utils';
import { getConfig } from '@config';

const toggleSidebar = createAction('settings/toggleSidebar');
const closeSidebar = createAction('settings/closeSidebar');
const openSidebar = createAction('settings/openSidebar');

const toggleSignedApprovals = createAction('settings/toggleSignedApprovals');

const setDefaultSlippage = createAsyncThunk<{ slippage: number }, { slippage: number }, ThunkAPI>(
  'settings/setDefaultSlippage',
  async ({ slippage }) => {
    const availableSlippages = getConfig().SLIPPAGE_OPTIONS;
    if (!availableSlippages.find((s) => s === slippage)) {
      throw new Error('SLIPPAGE NOT IN AVAILABLE SLIPPAGES');
    } else if (slippage >= 0.2) {
      throw new Error('SLIPPAGE IS BIGGER THAN 20%');
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
      dispatch(WalletActions.getAddressEnsName({ address: context.wallet.selectedAddress }));
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
      dispatch(WalletActions.getAddressEnsName({ address }));
    }
  }
);

export const SettingsActions = {
  toggleSidebar,
  closeSidebar,
  openSidebar,
  toggleSignedApprovals,
  setDefaultSlippage,
  toggleDevMode,
  changeWalletAddressOverride,
};
