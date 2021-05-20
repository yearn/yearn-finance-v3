import { combineReducers, Reducer } from '@reduxjs/toolkit';

import { RootState } from '@types';

import appReducer from './app/app.reducer';
import { AppActions } from './app/app.actions';

import modalsReducer from './modals/modals.reducer';
import { ModalsActions } from './modals/modals.actions';

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

import ironBankReducer from './ironBank/ironBank.reducer';
import { IronBankActions } from './ironBank/ironBank.actions';
import { IronBankSelectors } from './ironBank/ironBank.selectors';

const rootReducer: Reducer<RootState> = combineReducers({
  app: appReducer,
  modals: modalsReducer,
  route: routeReducer,
  theme: themeReducer,
  vaults: vaultsReducer,
  wallet: walletReducer,
  tokens: tokensReducer,
  ironBank: ironBankReducer,
});

export default rootReducer;

// Actions
export {
  AppActions,
  VaultsActions,
  ModalsActions,
  RouteActions,
  ThemeActions,
  WalletActions,
  TokensActions,
  IronBankActions,
};

// Selectors
export { VaultsSelectors, WalletSelectors, IronBankSelectors };
