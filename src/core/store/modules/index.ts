import { combineReducers, Reducer } from '@reduxjs/toolkit';

import appReducer, { initApp } from './app';
import routeReducer, { changeRoute } from './route';
import themeReducer, { changeTheme } from './theme';
import vaultsReducer, { getVaults } from './vaults';
import walletReducer, { walletSelect, changeWalletTheme } from './wallet';
import { RootState } from '@types';

const rootReducer: Reducer<RootState> = combineReducers({
  app: appReducer,
  route: routeReducer,
  theme: themeReducer,
  vaults: vaultsReducer,
  wallet: walletReducer,
});

export default rootReducer;
export { initApp, changeRoute, changeTheme, getVaults, walletSelect, changeWalletTheme };
