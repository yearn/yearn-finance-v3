import { createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { WalletActions } from '@store';
import { Network } from '@types';

const changeNetwork = createAsyncThunk<{ network: Network }, { network: Network }, ThunkAPI>(
  'network/changeNetwork',
  async ({ network }, { dispatch, extra }) => {
    const { wallet, web3Provider, yearnSdk } = extra.context;
    if (wallet.isCreated) {
      await dispatch(WalletActions.changeWalletNetwork(network));
    }
    if (extra.config.SUPPORTED_NETWORKS.includes(network)) {
      web3Provider.changeProviderType(network);
      yearnSdk.context.setProvider({
        read: web3Provider.getInstanceOf(web3Provider.providerType),
        write: web3Provider.getInstanceOf('wallet'),
      });
    }
    return { network };
  }
);

export const NetworkActions = {
  changeNetwork,
};
