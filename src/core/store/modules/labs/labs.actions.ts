import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '../../../frameworks/redux';
import { Lab } from '@types';

const initiateLabs = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'labs/initiateLabs',
  async (_arg, { dispatch }) => {
    await dispatch(getLabs());
  }
);

const getLabs = createAsyncThunk<{ labsData: Lab[] }, void, ThunkAPI>('labs/getLabs', async (_arg, { extra }) => {
  const { labService } = extra.services;
  const labsData = await labService.getSupportedLabs();
  return { labsData };
});

export const LabsActions = {
  initiateLabs,
  getLabs,
};
