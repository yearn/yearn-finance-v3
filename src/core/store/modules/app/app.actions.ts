import { createAsyncThunk } from '@reduxjs/toolkit';
import { isEqual } from 'lodash';

import { ThunkAPI } from '@frameworks/redux';
import { isGnosisApp, isLedgerLive } from '@utils';
import { Network, Route, Address, Vault } from '@types';

import { WalletActions } from '../wallet/wallet.actions';
import { TokensActions } from '../tokens/tokens.actions';
import { VaultsActions } from '../vaults/vaults.actions';
import { LabsActions } from '../labs/labs.actions';
import { NetworkActions } from '../network/network.actions';
import { PartnerActions } from '../partner/partner.actions';
import { SettingsActions } from '../settings/settings.actions';

/* -------------------------------------------------------------------------- */
/*                                 Clear State                                */
/* -------------------------------------------------------------------------- */

const clearAppData = createAsyncThunk<void, void, ThunkAPI>('app/clearAppData', async (_, { dispatch }) => {
  await Promise.all([
    dispatch(TokensActions.clearTokensData()),
    dispatch(VaultsActions.clearVaultsData()),
    dispatch(LabsActions.clearLabsData()),
  ]);
});

const clearUserAppData = createAsyncThunk<void, void, ThunkAPI>('app/clearUserAppData', async (_, { dispatch }) => {
  await Promise.all([
    dispatch(TokensActions.clearUserTokenState()),
    dispatch(VaultsActions.clearUserData()),
    dispatch(LabsActions.clearUserData()),
  ]);
});

/* -------------------------------------------------------------------------- */
/*                                 Fetch Data                                 */
/* -------------------------------------------------------------------------- */

const initApp = createAsyncThunk<void, void, ThunkAPI>('app/initApp', async (_arg, { dispatch, getState, extra }) => {
  const { CONTRACT_ADDRESSES } = extra.config;
  const { wallet, network, settings } = getState();
  if (isLedgerLive()) {
    if (network.current !== 'mainnet') await dispatch(NetworkActions.changeNetwork({ network: 'mainnet' }));
    if (settings.signedApprovalsEnabled) await dispatch(SettingsActions.toggleSignedApprovals());
    await dispatch(WalletActions.walletSelect({ walletName: 'Iframe', network: 'mainnet' }));
    await dispatch(PartnerActions.changePartner({ id: 'ledger', address: CONTRACT_ADDRESSES.LEDGER }));
  } else if (isGnosisApp()) {
    if (network.current !== 'mainnet') await dispatch(NetworkActions.changeNetwork({ network: 'mainnet' }));
    await dispatch(WalletActions.walletSelect({ walletName: 'Gnosis Safe', network: 'mainnet' }));
  } else if (wallet.name && wallet.name !== 'Iframe') {
    await dispatch(WalletActions.walletSelect({ walletName: wallet.name, network: network.current }));
  }
  // TODO use when sdk ready
  // dispatch(initSubscriptions());
});

const getAppData = createAsyncThunk<void, { network: Network; route: Route; addresses?: Address[] }, ThunkAPI>(
  'app/getAppData',
  async ({ route, addresses }, { dispatch }) => {
    switch (route) {
      case 'portfolio':
        await Promise.all([dispatch(VaultsActions.initiateSaveVaults()), dispatch(LabsActions.initiateLabs())]);
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
    }
  },
  {
    condition: (args, { getState }) => {
      const { app } = getState();
      if (isEqual(app.statusMap.getAppData.callArgs, args)) return false;
    },
  }
);

const getUserAppData = createAsyncThunk<void, { network: Network; route: Route; addresses?: Address[] }, ThunkAPI>(
  'app/getUserAppData',
  async ({ route, addresses }, { dispatch }) => {
    dispatch(TokensActions.getUserTokens({})); // always fetch all user tokens
    switch (route) {
      case 'portfolio':
        dispatch(VaultsActions.getUserVaultsSummary());
        dispatch(LabsActions.getUserLabsPositions({}));
        break;
      case 'vaults':
        dispatch(VaultsActions.getUserVaultsSummary());
        dispatch(VaultsActions.getUserVaultsPositions({}));
        dispatch(VaultsActions.getUserVaultsMetadata({}));
        break;
      case 'vault':
        dispatch(VaultsActions.getUserVaultsPositions({ vaultAddresses: addresses }));
        dispatch(VaultsActions.getUserVaultsMetadata({ vaultsAddresses: addresses }));
        break;
      case 'labs':
        dispatch(LabsActions.getUserLabsPositions({}));
        break;
    }
  },
  {
    condition: (args, { getState }) => {
      const { app } = getState();
      if (isEqual(app.statusMap.user.getUserAppData.callArgs, args)) return false;
    },
  }
);

/* -------------------------------------------------------------------------- */
/*                                Subscriptions                               */
/* -------------------------------------------------------------------------- */

const initSubscriptions = createAsyncThunk<void, void, ThunkAPI>(
  'app/initSubscriptions',
  async (_arg, { dispatch }) => {
    dispatch(TokensActions.initSubscriptions());
    dispatch(VaultsActions.initSubscriptions());
  }
);

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export const AppActions = {
  clearAppData,
  clearUserAppData,
  initApp,
  getAppData,
  getUserAppData,
  initSubscriptions,
};
