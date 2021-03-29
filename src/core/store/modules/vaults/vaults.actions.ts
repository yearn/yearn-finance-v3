import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '../../../frameworks/redux';
import { VaultData } from '@types';

export const getVaults = createAsyncThunk<{ supportedVaults: VaultData[] }, null, ThunkAPI>(
  'vaults/getVaults',
  async (_arg, { extra }) => {
    const { getSupportedVaults } = extra.services;
    const supportedVaults = await getSupportedVaults.execute();
    return { supportedVaults };
  }
);
