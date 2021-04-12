import { createAction } from '@reduxjs/toolkit';

const changeRoute = createAction<{ path: string }>('route/chageRoute');

export const RouteActions = {
  changeRoute,
};
