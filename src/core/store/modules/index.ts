import { combineReducers, Reducer } from '@reduxjs/toolkit';

import { RootState } from '@types';

import appReducer from './app/app.reducer';
import { initApp } from './app/app.actions';

import routeReducer from './route/route.reducer';
import { changeRoute } from './route/route.actions';

import themeReducer from './theme/theme.reducer';
import { changeTheme } from './theme/theme.actions';

import vaultsReducer from './vaults/vaults.reducer';
import { getVaults, initiateSaveVaults, setSelectedVaultAddress } from './vaults/vaults.actions';
import { selectSaveVaults, selectSelectedVault } from './vaults/vaults.selectors';

import walletReducer from './wallet/wallet.reducer';
import { walletSelect, changeWalletTheme } from './wallet/wallet.actions';

import userReducer from './user/user.reducer';
import { getUserVaultsData } from './user/user.actions';

import tokensReducer from './tokens/tokens.reducer';
import { getTokens } from './tokens/tokens.actions';

const rootReducer: Reducer<RootState> = combineReducers({
  app: appReducer,
  route: routeReducer,
  theme: themeReducer,
  vaults: vaultsReducer,
  wallet: walletReducer,
  user: userReducer,
  tokens: tokensReducer,
});

export default rootReducer;
export {
  initApp,
  initiateSaveVaults,
  changeRoute,
  changeTheme,
  getVaults,
  walletSelect,
  changeWalletTheme,
  getUserVaultsData,
  getTokens,
  setSelectedVaultAddress,
};
export { selectSaveVaults, selectSelectedVault };
