import { combineReducers, Reducer } from '@reduxjs/toolkit';

import { RootState } from '@types';

import appReducer from './app/app.reducer';
import { initApp } from './app/app.actions';

import routeReducer from './route/route.reducer';
import { changeRoute } from './route/route.actions';

import themeReducer from './theme/theme.reducer';
import { changeTheme } from './theme/theme.actions';

import vaultsReducer from './vaults/vaults.reducer';
import {
  getVaults,
  initiateSaveVaults,
  setSelectedVaultAddress,
  depositVault,
  approveVault,
  withdrawVault,
} from './vaults/vaults.actions';
import {
  selectSaveVaults,
  selectSelectedVault,
  selectSelectedVaultActionsStatusMap,
  selectSaveVaultsGeneralStatus,
} from './vaults/vaults.selectors';

import walletReducer from './wallet/wallet.reducer';
import { walletSelect, changeWalletTheme } from './wallet/wallet.actions';
import { selectWallet, selectWalletIsConnected } from './wallet/wallet.selectors';

import userReducer from './user/user.reducer';
import { getUserVaultsData, setUserTokenData } from './user/user.actions';

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
  depositVault,
  approveVault,
  withdrawVault,
  setUserTokenData,
};
export {
  selectSaveVaults,
  selectSelectedVault,
  selectSelectedVaultActionsStatusMap,
  selectSaveVaultsGeneralStatus,
  selectWallet,
  selectWalletIsConnected,
};
