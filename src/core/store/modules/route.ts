import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RouteState } from '@types';

const initialState: RouteState = {
  path: undefined,
};

const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    changeRoute(state, action: PayloadAction<string>) {
      state.path = action.payload;
    },
  },
});

export const { changeRoute } = routeSlice.actions;
export default routeSlice.reducer;
