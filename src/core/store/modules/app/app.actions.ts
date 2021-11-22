import { createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { inIframe } from '@utils';

import { WalletActions } from '../wallet/wallet.actions';
import { TokensActions } from '../tokens/tokens.actions';
import { VaultsActions } from '../vaults/vaults.actions';

const initApp = createAsyncThunk<void, void, ThunkAPI>('app/initApp', async (_arg, { dispatch, getState }) => {
  const { wallet, network } = getState();
  if (inIframe()) {
    await dispatch(WalletActions.walletSelect({ walletName: 'Iframe', network: 'mainnet' }));
  } else if (wallet.name) {
    await dispatch(WalletActions.walletSelect({ walletName: wallet.name, network: network.current }));
  }
  // TODO use when sdk ready
  // dispatch(initSubscriptions());
});

const initSubscriptions = createAsyncThunk<void, void, ThunkAPI>(
  'app/initSubscriptions',
  async (_arg, { dispatch }) => {
    dispatch(TokensActions.initSubscriptions());
    dispatch(VaultsActions.initSubscriptions());
  }
);

export const AppActions = {
  initApp,
  initSubscriptions,
};
