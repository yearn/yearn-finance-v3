import { combineReducers, Reducer } from '@reduxjs/toolkit';

import { RootState } from '@types';

import appReducer from './app/app.reducer';
import { AppActions } from './app/app.actions';

import routeReducer from './route/route.reducer';
import { RouteActions } from './route/route.actions';

import themeReducer from './theme/theme.reducer';
import { ThemeActions } from './theme/theme.actions';

import vaultsReducer from './vaults/vaults.reducer';
import { VaultsActions } from './vaults/vaults.actions';
import { VaultsSelectors } from './vaults/vaults.selectors';

import walletReducer from './wallet/wallet.reducer';
import { WalletActions } from './wallet/wallet.actions';
import { selectWallet, selectWalletIsConnected } from './wallet/wallet.selectors';

import userReducer from './user/user.reducer';
import { UserActions } from './user/user.actions';

import tokensReducer from './tokens/tokens.reducer';
import { TokensActions } from './tokens/tokens.actions';

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
export { UserActions, AppActions, VaultsActions, RouteActions, ThemeActions, WalletActions, TokensActions };
export { VaultsSelectors, selectWallet, selectWalletIsConnected };
