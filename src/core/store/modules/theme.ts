import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ThemeState, Theme } from '@types';

const initialState: ThemeState = {
  current: 'default',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    changeTheme(state, action: PayloadAction<Theme>) {
      state.current = action.payload;
    },
  },
});

export const { changeTheme } = themeSlice.actions;
export default themeSlice.reducer;
