import { RootState } from '@types';

const selectRouteState = (state: RootState) => state.route;

export const RouteSelectors = {
  selectRouteState,
};
