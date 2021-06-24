import { combineReducers, Reducer } from '@reduxjs/toolkit';

import { RootState } from '@types';

import appReducer from './app/app.reducer';
import { AppActions } from './app/app.actions';

import alertsReducer, { alertsInitialState } from './alerts/alerts.reducer';
import { AlertsActions } from './alerts/alerts.actions';
import { AlertsSelectors } from './alerts/alerts.selectors';

import modalsReducer from './modals/modals.reducer';
import { ModalsActions } from './modals/modals.actions';
import { ModalSelectors } from './modals/modals.selectors';

import routeReducer from './route/route.reducer';
import { RouteActions } from './route/route.actions';

import themeReducer from './theme/theme.reducer';
import { ThemeActions } from './theme/theme.actions';

import vaultsReducer from './vaults/vaults.reducer';
import { VaultsActions } from './vaults/vaults.actions';
import { VaultsSelectors } from './vaults/vaults.selectors';

import walletReducer from './wallet/wallet.reducer';
import { WalletActions } from './wallet/wallet.actions';
import { WalletSelectors } from './wallet/wallet.selectors';

import tokensReducer from './tokens/tokens.reducer';
import { TokensActions } from './tokens/tokens.actions';
import { TokensSelectors } from './tokens/tokens.selectors';

import ironBankReducer from './ironBank/ironBank.reducer';
import { IronBankActions } from './ironBank/ironBank.actions';
import { IronBankSelectors } from './ironBank/ironBank.selectors';

import labsReducer from './labs/labs.reducer';
import { LabsActions } from './labs/labs.actions';
import { LabsSelectors } from './labs/labs.selectors';

import settingsReducer from './settings/settings.reducer';
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
export { alertsInitialState };
