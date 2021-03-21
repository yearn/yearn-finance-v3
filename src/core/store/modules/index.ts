import { combineReducers, Reducer } from '@reduxjs/toolkit';

import appReducer, { initApp } from './app';
import { RootState } from '@types';

const rootReducer: Reducer<RootState> = combineReducers({
  app: appReducer,
});

export default rootReducer;
export { initApp };
