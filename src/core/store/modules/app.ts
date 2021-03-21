import { createSlice } from '@reduxjs/toolkit';

import { AppState } from '@types';

const initialState: AppState = {
  isInitialized: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    initApp(state) {
      state.isInitialized = true;
    },
  },
});

export const { initApp } = appSlice.actions;
export default appSlice.reducer;
