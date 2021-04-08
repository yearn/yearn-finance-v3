import { createAction } from '@reduxjs/toolkit';

export const RouteActions = {
  changeRoute: createAction<{ path: string }>('route/chageRoute'),
};
