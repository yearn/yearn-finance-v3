import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '../../../frameworks/redux';

const initiateLabs = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'labs/initiateLabs',
  async (_arg, { dispatch }) => {}
);

export const LabsActions = {
  initiateLabs,
};
