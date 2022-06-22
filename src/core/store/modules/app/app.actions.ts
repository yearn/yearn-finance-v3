import { createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { isEqual } from 'lodash';

import { ThunkAPI } from '@frameworks/redux';
import { isGnosisApp, isLedgerLive, isCoinbaseApp, get } from '@utils';
import { Network, Route, Address, Vault, ExternalServiceId } from '@types';

import { WalletActions } from '../wallet/wallet.actions';
import { TokensActions } from '../tokens/tokens.actions';
import { VaultsActions } from '../vaults/vaults.actions';
import { LabsActions } from '../labs/labs.actions';
import { VotingEscrowsActions } from '../votingEscrows/votingEscrows.actions';
import { AlertsActions } from '../alerts/alerts.actions';
import { NetworkActions } from '../network/network.actions';
import { PartnerActions } from '../partner/partner.actions';
import { SettingsActions } from '../settings/settings.actions';

/* -------------------------------------------------------------------------- */
/*                                   Setters                                  */
/* -------------------------------------------------------------------------- */

const disableService = createAction<{ service: ExternalServiceId }>('app/disableService');

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
    const walletName = 'Gnosis Safe';
    if (network.current !== 'mainnet') await dispatch(NetworkActions.changeNetwork({ network: 'mainnet' }));
    await dispatch(WalletActions.walletSelect({ walletName, network: 'mainnet' }));
  } else if (isCoinbaseApp()) {
    const walletName = 'Coinbase Wallet';
    await dispatch(WalletActions.walletSelect({ walletName, network: 'mainnet' }));
  } else if (wallet.name && wallet.name !== 'Iframe') {
    await dispatch(WalletActions.walletSelect({ walletName: wallet.name, network: network.current }));
  }
  dispatch(checkExternalServicesStatus());
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
      case 'veyfi':
        await dispatch(VotingEscrowsActions.initiateVotingEscrows());
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
      case 'veyfi':
        await dispatch(VotingEscrowsActions.getUserVotingEscrowsPositions({ addresses }));
        await dispatch(VotingEscrowsActions.getUserVotingEscrowsMetadata({ addresses }));
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
/*                                  Services                                  */
/* -------------------------------------------------------------------------- */

const checkExternalServicesStatus = createAsyncThunk<void, void, ThunkAPI>(
  'app/checkExternalServicesStatus',
  async (_arg, { dispatch, extra }) => {
    const { YEARN_ALERTS_API } = extra.config;
    try {
      const { status, data } = await get(`${YEARN_ALERTS_API}/health`);
      if (status !== 200) throw new Error('Service status provider not currently accessible');

      const errorMessageTemplate =
        'service is currently experiencing technical issues and have been temporarily disabled. We apologize for any inconvenience this may cause, we are actively working on resolving these issues';
      const downgradedServicesMessages = [];
      const { zapper, simulations } = data;
      if (!zapper) {
        dispatch(disableService({ service: 'zapper' }));
        downgradedServicesMessages.push(`Zapper ${errorMessageTemplate}`);
      }

      if (!simulations) {
        dispatch(disableService({ service: 'tenderly' }));
        downgradedServicesMessages.push(`Simulations ${errorMessageTemplate}`);
      }

      downgradedServicesMessages.forEach(async (message) => {
        dispatch(
          AlertsActions.openAlert({
            message,
            type: 'warning',
            persistent: true,
          })
        );
      });
    } catch (error) {
      console.log(error);
    }
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
  disableService,
  clearAppData,
  clearUserAppData,
  initApp,
  getAppData,
  getUserAppData,
  initSubscriptions,
};
