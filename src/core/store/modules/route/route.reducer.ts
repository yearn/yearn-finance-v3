import { createReducer } from '@reduxjs/toolkit';
import { RouteState } from '@types';
import { RouteActions } from './route.actions';

export const routeInitialState: RouteState = {
  path: undefined,
};

const { changeRoute } = RouteActions;

const routeReducer = createReducer(routeInitialState, (builder) => {
  builder.addCase(changeRoute, (state, { payload: { path } }) => {
    state.path = path;
  });
});

export default routeReducer;
