import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '../../../frameworks/redux';
import { Lab, LabDynamic } from '@types';

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

const getLabsDynamic = createAsyncThunk<{ labsDynamicData: LabDynamic[] }, { addresses: string[] }, ThunkAPI>(
  'labs/getLabsDynamic',
  async ({ addresses }, { extra }) => {
    const { labService } = extra.services;
    // const labsDynamicData = await labService.getLabsDynamicData(addresses); // TODO pass addresses. waitint to xgaminto to merge his stuff to avoid conficts y lab service
    const labsDynamicData = await labService.getLabsDynamicData();
    return { labsDynamicData };
  }
);

export const LabsActions = {
  initiateLabs,
  getLabs,
  getLabsDynamic,
};
