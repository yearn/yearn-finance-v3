import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';

import rootReducer from '@store/modules';
import { isDev } from '@utils';
import { DIContainer } from '@types';

export const getStore = (extraArgument?: any) => {
  const logger = createLogger({ collapsed: true });
  const middlewareOptions = {
    thunk: {
      extraArgument,
    },
  };
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      isDev()
        ? getDefaultMiddleware(middlewareOptions).concat(logger)
        : getDefaultMiddleware(middlewareOptions),
    devTools: isDev(),
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
