import { createReducer } from '@reduxjs/toolkit';
import { RouteState } from '@types';
import { RouteActions } from './route.actions';

const initialState: RouteState = {
  path: undefined,
};

const routeReducer = createReducer(initialState, (builder) => {
  builder.addCase(RouteActions.changeRoute, (state, { payload: { path } }) => {
    state.path = path;
  });
});

export default routeReducer;
