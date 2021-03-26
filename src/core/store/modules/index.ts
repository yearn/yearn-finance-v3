import { combineReducers, Reducer } from '@reduxjs/toolkit';

import themeReducer, { changeTheme } from './theme';
import vaultsReducer, { getVaults } from './vaults';
import walletReducer, { walletSelect, changeWalletTheme } from './wallet';
import { RootState } from '@types';

import appReducer from '../app/app.reducer';
import { initApp } from '../app/app.actions';

import routeReducer from '../route/route.reducer';
import { changeRoute } from '../route/route.actions';

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
