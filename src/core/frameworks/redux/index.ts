import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';

import rootReducer from '@store/modules';
import { isDev } from '@utils';

export const getStore = () => {
  const logger = createLogger({ collapsed: true });
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
    devTools: isDev(),
  });

  return store;
};
