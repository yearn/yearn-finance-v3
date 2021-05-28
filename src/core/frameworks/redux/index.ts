import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { save, load } from 'redux-localstorage-simple';

import rootReducer from '@store/modules';
import { isDev } from '@utils';
import { DIContainer } from '@types';

export const getStore = (extraArgument?: any) => {
  const persistConfig = {
    namespace: 'yearn',
    states: ['theme', 'wallet.name', 'settings'],
  };
  const logger = createLogger({ collapsed: true });
  const middlewareOptions = {
    thunk: {
      extraArgument,
    },
  };
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
    preloadedState: load(persistConfig),
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
