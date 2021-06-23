import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { save, load, clear } from 'redux-localstorage-simple';
import { merge, cloneDeep, get } from 'lodash';

import rootReducer, { themeInitialState, walletInitialState, settingsInitialState } from '@store/modules';
import { isDev } from '@utils';
import { DIContainer } from '@types';

export const getStore = (extraArgument?: any) => {
  const initialState = {
    theme: cloneDeep(themeInitialState),
    wallet: cloneDeep(walletInitialState),
    settings: cloneDeep(settingsInitialState),
  };
  const persistConfig = {
    namespace: 'yearn',
    states: ['theme', 'wallet.name', 'settings.devMode', 'settings.persistedStateVersion'],
  };
  const logger = createLogger({ collapsed: true });
  const middlewareOptions = {
    thunk: {
      extraArgument,
    },
  };
  let persistedState = load(persistConfig);
  const currentStateVersion = initialState.settings.currentStateVersion;
  const persistedStateVersion = get(persistedState, 'settings.persistedStateVersion');
  if (persistedStateVersion && persistedStateVersion < currentStateVersion) {
    // HANDLE STATE BREAKING CHANGES WITH MIGRATIONS HERE OR JUST CLEAR LOCAL STORAGE
    persistedState = {};
    clear({
      namespace: 'yearn',
    });
  }

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
      let middleware = getDefaultMiddleware(middlewareOptions);
      middleware.push(save(persistConfig));
      if (isDev()) {
        middleware.push(logger);
      }
      return middleware;
    },
    devTools: isDev(),
    preloadedState: merge(initialState, persistedState),
  });

  return store;
};

export type Store = ReturnType<typeof getStore>;
export type RootState = ReturnType<Store['getState']>;
export type AppDispatch = Store['dispatch'];
export interface ThunkAPI {
  dispatch: AppDispatch;
  state: RootState;
  extra: DIContainer;
}
