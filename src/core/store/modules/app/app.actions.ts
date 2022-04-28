import { createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { isEqual } from 'lodash';

import { ThunkAPI } from '@frameworks/redux';
import { inIframe, get } from '@utils';
import { Network, Route, Address, Vault, Service } from '@types';

import { WalletActions } from '../wallet/wallet.actions';
import { TokensActions } from '../tokens/tokens.actions';
import { VaultsActions } from '../vaults/vaults.actions';
import { LabsActions } from '../labs/labs.actions';
import { IronBankActions } from '../ironBank/ironBank.actions';
import { AlertsActions } from '../alerts/alerts.actions';

/* -------------------------------------------------------------------------- */
/*                                   Setters                                  */
/* -------------------------------------------------------------------------- */

const disableService = createAction<{ service: Service }>('app/disableService');

/* -------------------------------------------------------------------------- */
/*                                 Clear State                                */
/* -------------------------------------------------------------------------- */

const clearAppData = createAsyncThunk<void, void, ThunkAPI>('app/clearAppData', async (_, { dispatch }) => {
  await Promise.all([
    dispatch(TokensActions.clearTokensData()),
    dispatch(VaultsActions.clearVaultsData()),
    dispatch(LabsActions.clearLabsData()),
    dispatch(IronBankActions.clearIronBankData()),
  ]);
});

const clearUserAppData = createAsyncThunk<void, void, ThunkAPI>('app/clearUserAppData', async (_, { dispatch }) => {
  await Promise.all([
    dispatch(TokensActions.clearUserTokenState()),
    dispatch(VaultsActions.clearUserData()),
    dispatch(LabsActions.clearUserData()),
    dispatch(IronBankActions.clearUserData()),
  ]);
});

/* -------------------------------------------------------------------------- */
/*                                 Fetch Data                                 */
/* -------------------------------------------------------------------------- */

const initApp = createAsyncThunk<void, void, ThunkAPI>('app/initApp', async (_arg, { dispatch, getState }) => {
  const { wallet, network } = getState();
  if (inIframe()) {
    await dispatch(WalletActions.walletSelect({ walletName: 'Iframe', network: 'mainnet' }));
  } else if (wallet.name) {
    await dispatch(WalletActions.walletSelect({ walletName: wallet.name, network: network.current }));
  }
  dispatch(checkServicesStatus());
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
      case 'ironbank':
        await dispatch(IronBankActions.initiateIronBank());
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

        // TODO Check if we still need this
        dispatch(IronBankActions.getIronBankSummary()); // use only this when lens summary calculation fixed
        dispatch(IronBankActions.getUserMarketsPositions({})); // remove this when lens summary calculation fixed
        dispatch(IronBankActions.getUserMarketsMetadata({})); // remove this when lens summary calculation fixed
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
      case 'ironbank':
        dispatch(IronBankActions.getIronBankSummary());
        dispatch(IronBankActions.getUserMarketsPositions({}));
        dispatch(IronBankActions.getUserMarketsMetadata({}));
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

const checkServicesStatus = createAsyncThunk<void, void, ThunkAPI>(
  'app/checkServicesStatus',
  async (_arg, { dispatch, extra }) => {
    const { YEARN_ALERTS_API } = extra.config;
    try {
      const servicesStatusResponse = await get(`${YEARN_ALERTS_API}/health`);
      if (servicesStatusResponse.status !== 200) throw new Error('Service status provider not currently accesible');

      const errorMessageTemplate =
        'service is currently experiencing technical issues and have been temporarily disabled. We are sorry for the inconveniences, we are working towards issues been resolved soon.';
      const downgradedServicesMessages = [];
      const { zapper, simulations } = servicesStatusResponse.data;
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
