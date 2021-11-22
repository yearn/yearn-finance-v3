import { createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { inIframe } from '@utils';
import { Route, Address, Vault } from '@types';

import { WalletActions } from '../wallet/wallet.actions';
import { TokensActions } from '../tokens/tokens.actions';
import { VaultsActions } from '../vaults/vaults.actions';
import { LabsActions } from '../labs/labs.actions';
import { IronBankActions } from '../ironBank/ironBank.actions';

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

const getAppData = createAsyncThunk<void, { route: Route; addresses?: Address[] }, ThunkAPI>(
  'app/getAppData',
  async ({ route, addresses }, { dispatch }) => {
    switch (route) {
      case 'home':
        await dispatch(LabsActions.initiateLabs());
        break;
      case 'wallet':
        await Promise.all([dispatch(VaultsActions.initiateSaveVaults()), dispatch(IronBankActions.initiateIronBank())]);
        break;
      case 'vaults':
        await dispatch(VaultsActions.initiateSaveVaults());
        break;
      case 'vault':
        await dispatch(VaultsActions.getVaults({ addresses })).then(({ payload }: any) => {
          const vaults: Vault[] = payload.vaultsData;
          const vault = vaults.pop();
          if (vault && vault.metadata.migrationTargetVault)
            dispatch(VaultsActions.getVaults({ addresses: [vault.metadata.migrationTargetVault] }));
        });
        break;
      case 'labs':
        await dispatch(LabsActions.initiateLabs());
        break;
      case 'ironbank':
        await dispatch(IronBankActions.initiateIronBank());
        break;
    }
  }
);

const initSubscriptions = createAsyncThunk<void, void, ThunkAPI>(
  'app/initSubscriptions',
  async (_arg, { dispatch }) => {
    dispatch(TokensActions.initSubscriptions());
    dispatch(VaultsActions.initSubscriptions());
  }
);

export const AppActions = {
  initApp,
  getAppData,
  initSubscriptions,
};
