import { createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { notify } from '@frameworks/blocknative';
import { getProviderType, getNetworkId } from '@utils';
import { Network } from '@types';

import { WalletActions } from '../wallet/wallet.actions';

const changeNetwork = createAsyncThunk<{ network: Network }, { network: Network }, ThunkAPI>(
  'network/changeNetwork',
  async ({ network }, { dispatch, extra, getState }) => {
    const { context, config } = extra;
    const { wallet, web3Provider, yearnSdk } = context;

    if (!config.SUPPORTED_NETWORKS.includes(network)) throw Error('Network Not Supported');

    if (wallet.isCreated) {
      dispatch(WalletActions.changeWalletNetwork({ network }));
    }

    if (web3Provider.hasInstanceOf('wallet')) {
      const providerType = getProviderType(network);
      const provider = web3Provider.getInstanceOf(providerType);
      const yearn = yearnSdk.getInstanceOf(network);
      yearn.context.setProvider({
        read: provider,
        write: web3Provider.getInstanceOf('wallet'),
      });
    }

    notify.config({ networkId: getNetworkId(network) });

    return { network };
  }
);

export const NetworkActions = {
  changeNetwork,
};
