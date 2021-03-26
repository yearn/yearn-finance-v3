import { combineReducers, Reducer } from '@reduxjs/toolkit';

import walletReducer, { walletSelect, changeWalletTheme } from './wallet';
import { RootState } from '@types';

import appReducer from '../app/app.reducer';
import { initApp } from '../app/app.actions';

import routeReducer from '../route/route.reducer';
import { changeRoute } from '../route/route.actions';

import themeReducer from '../theme/theme.reducer';
import { changeTheme } from '../theme/theme.actions';

import vaultsReducer from '../vaults/vaults.reducer';
import { getVaults } from '../vaults/vaults.actions';

const rootReducer: Reducer<RootState> = combineReducers({
  app: appReducer,
  route: routeReducer,
  theme: themeReducer,
  vaults: vaultsReducer,
  wallet: walletReducer,
});

export default rootReducer;
export {
  initApp,
  changeRoute,
  changeTheme,
  getVaults,
  walletSelect,
  changeWalletTheme,
};
