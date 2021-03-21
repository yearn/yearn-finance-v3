import { combineReducers, Reducer } from '@reduxjs/toolkit';

import appReducer, { initApp } from './app';
import themeReducer, { changeTheme } from './theme';
import { RootState } from '@types';

const rootReducer: Reducer<RootState> = combineReducers({
  app: appReducer,
  theme: themeReducer,
});

export default rootReducer;
export { initApp, changeTheme };
