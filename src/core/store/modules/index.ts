import { combineReducers, Reducer } from '@reduxjs/toolkit';

import { RootState } from '@types';

import appReducer, { appInitialState } from './app/app.reducer';
import { AppActions } from './app/app.actions';

import alertsReducer, { alertsInitialState } from './alerts/alerts.reducer';
import { AlertsActions } from './alerts/alerts.actions';
import { AlertsSelectors } from './alerts/alerts.selectors';

import modalsReducer, { modalsInitialState } from './modals/modals.reducer';
import { ModalsActions } from './modals/modals.actions';
import { ModalSelectors } from './modals/modals.selectors';

import routeReducer, { routeInitialState } from './route/route.reducer';
import { RouteActions } from './route/route.actions';

import themeReducer, { themeInitialState } from './theme/theme.reducer';
import { ThemeActions } from './theme/theme.actions';

import vaultsReducer, { vaultsInitialState } from './vaults/vaults.reducer';
import { VaultsActions } from './vaults/vaults.actions';
import { VaultsSelectors } from './vaults/vaults.selectors';

import walletReducer, { walletInitialState } from './wallet/wallet.reducer';
import { WalletActions } from './wallet/wallet.actions';
import { WalletSelectors } from './wallet/wallet.selectors';

import tokensReducer, { tokensInitialState } from './tokens/tokens.reducer';
import { TokensActions } from './tokens/tokens.actions';
import { TokensSelectors } from './tokens/tokens.selectors';

import ironBankReducer, { ironBankInitialState } from './ironBank/ironBank.reducer';
import { IronBankActions } from './ironBank/ironBank.actions';
import { IronBankSelectors } from './ironBank/ironBank.selectors';

import labsReducer, { labsInitialState } from './labs/labs.reducer';
import { LabsActions } from './labs/labs.actions';
import { LabsSelectors } from './labs/labs.selectors';

import settingsReducer, { settingsInitialState } from './settings/settings.reducer';
import { SettingsActions } from './settings/settings.actions';
import { SettingsSelectors } from './settings/settings.selectors';

const rootReducer: Reducer<RootState> = combineReducers({
  app: appReducer,
  alerts: alertsReducer,
  modals: modalsReducer,
  route: routeReducer,
  theme: themeReducer,
  vaults: vaultsReducer,
  wallet: walletReducer,
  tokens: tokensReducer,
  ironBank: ironBankReducer,
  labs: labsReducer,
  settings: settingsReducer,
});

export default rootReducer;

// Actions
export {
  AppActions,
  AlertsActions,
  VaultsActions,
  ModalsActions,
  RouteActions,
  ThemeActions,
  WalletActions,
  TokensActions,
  IronBankActions,
  LabsActions,
  SettingsActions,
};

// Selectors
export {
  AlertsSelectors,
  ModalSelectors,
  VaultsSelectors,
  WalletSelectors,
  IronBankSelectors,
  TokensSelectors,
  SettingsSelectors,
  LabsSelectors,
};

// initialState
export {
  alertsInitialState,
  appInitialState,
  modalsInitialState,
  routeInitialState,
  themeInitialState,
  vaultsInitialState,
  walletInitialState,
  tokensInitialState,
  ironBankInitialState,
  labsInitialState,
  settingsInitialState,
};