import { createAction } from '@reduxjs/toolkit';

export const changeRoute = createAction<{ path: string }>('route/chageRoute');
