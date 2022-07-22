import { combineReducers, Reducer } from '@reduxjs/toolkit';

import { RootState } from '@types';

// App State
import appReducer, { appInitialState } from './app/app.reducer';
import { AppActions } from './app/app.actions';
import { AppSelectors } from './app/app.selectors';
// Alerts State
import alertsReducer, { alertsInitialState } from './alerts/alerts.reducer';
import { AlertsActions } from './alerts/alerts.actions';
import { AlertsSelectors } from './alerts/alerts.selectors';
// Modals State
import modalsReducer, { modalsInitialState } from './modals/modals.reducer';
import { ModalsActions } from './modals/modals.actions';
import { ModalSelectors } from './modals/modals.selectors';
// Networks State
import networkReducer, { networkInitialState } from './network/network.reducer';
import { NetworkActions } from './network/network.actions';
import { NetworkSelectors } from './network/network.selectors';
// Routes State
import routeReducer, { routeInitialState } from './route/route.reducer';
import { RouteActions } from './route/route.actions';
import { RouteSelectors } from './route/route.selectors';
// Theme State
import themeReducer, { themeInitialState } from './theme/theme.reducer';
import { ThemeActions } from './theme/theme.actions';
// Valut State
import vaultsReducer, { vaultsInitialState } from './vaults/vaults.reducer';
import { VaultsActions } from './vaults/vaults.actions';
import { VaultsSelectors } from './vaults/vaults.selectors';
// Wallet State
import walletReducer, { walletInitialState } from './wallet/wallet.reducer';
import { WalletActions } from './wallet/wallet.actions';
import { WalletSelectors } from './wallet/wallet.selectors';
// Tokens State
import tokensReducer, { tokensInitialState } from './tokens/tokens.reducer';
import { TokensActions } from './tokens/tokens.actions';
import { TokensSelectors } from './tokens/tokens.selectors';
// Labs State
// import labsReducer, { labsInitialState } from './labs/labs.reducer';
// import { LabsActions } from './labs/labs.actions';
// import { LabsSelectors } from './labs/labs.selectors';
// Settings State
import settingsReducer, { settingsInitialState } from './settings/settings.reducer';
import { SettingsActions } from './settings/settings.actions';
import { SettingsSelectors } from './settings/settings.selectors';
// User State
// import userReducer, { userInitialState } from './user/user.reducer';
// import { UserActions } from './user/user.actions';
// import { UserSelectors } from './user/user.selectors';
// Partner State
import partnerReducer, { partnerInitialState } from './partner/partner.reducer';
import { PartnerActions } from './partner/partner.actions';
import { PartnerSelectors } from './partner/partner.selectors';
// Loans State
import loansReducer, { loansInitialState } from './loans/loans.reducer';
import { LoansActions } from './loans/loans.actions';
import { LoansSelectors } from './loans/loans.selectors';

const rootReducer: Reducer<RootState> = combineReducers({
  app: appReducer,
  alerts: alertsReducer,
  modals: modalsReducer,
  network: networkReducer,
  route: routeReducer,
  theme: themeReducer,
  vaults: vaultsReducer,
  wallet: walletReducer,
  tokens: tokensReducer,
  // labs: labsReducer,
  settings: settingsReducer,
  // user: userReducer,
  partner: partnerReducer,
  loans: loansReducer,
});

export default rootReducer;

// Actions
export {
  AppActions,
  AlertsActions,
  VaultsActions,
  ModalsActions,
  NetworkActions,
  RouteActions,
  ThemeActions,
  WalletActions,
  TokensActions,
  // LabsActions,
  SettingsActions,
  // UserActions,
  PartnerActions,
  LoansActions,
};

// Selectors
export {
  AlertsSelectors,
  AppSelectors,
  ModalSelectors,
  NetworkSelectors,
  RouteSelectors,
  VaultsSelectors,
  WalletSelectors,
  TokensSelectors,
  SettingsSelectors,
  // LabsSelectors,
  // UserSelectors,
  PartnerSelectors,
  LoansSelectors,
};

// initialState
export {
  alertsInitialState,
  appInitialState,
  modalsInitialState,
  networkInitialState,
  routeInitialState,
  themeInitialState,
  vaultsInitialState,
  walletInitialState,
  tokensInitialState,
  // labsInitialState,
  settingsInitialState,
  // userInitialState,
  partnerInitialState,
  loansInitialState,
};
