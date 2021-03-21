import { combineReducers, Reducer } from '@reduxjs/toolkit';

import appReducer, { initApp } from './app';
import routeReducer, { changeRoute } from './route';
import themeReducer, { changeTheme } from './theme';
import { RootState } from '@types';

const rootReducer: Reducer<RootState> = combineReducers({
  app: appReducer,
  route: routeReducer,
  theme: themeReducer,
});

export default rootReducer;
export { initApp, changeRoute, changeTheme };
