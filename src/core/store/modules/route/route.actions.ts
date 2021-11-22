import { createAction } from '@reduxjs/toolkit';

const changeRoute = createAction<{ path: string }>('route/changeRoute');

export const RouteActions = {
  changeRoute,
};
