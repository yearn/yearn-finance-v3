import { createReducer } from '@reduxjs/toolkit';
import { RouteState } from '@types';
import { RouteActions } from './route.actions';

const initialState: RouteState = {
  path: undefined,
};

const { changeRoute } = RouteActions;

const routeReducer = createReducer(initialState, (builder) => {
  builder.addCase(changeRoute, (state, { payload: { path } }) => {
    state.path = path;
  });
});

export default routeReducer;
