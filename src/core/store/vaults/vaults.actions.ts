import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '../../frameworks/redux';
import { GetSupportedVaultsServiceResult } from '../../types';

export const getVaults = createAsyncThunk<
  { supportedVaults: GetSupportedVaultsServiceResult[] },
  string | undefined,
  ThunkAPI
>('vaults/getVaults', async (_arg, { extra }) => {
  const { getSupportedVaults } = extra.services;
  const supportedVaults = await getSupportedVaults.execute();
  return { supportedVaults };
});

// export namespace VaultsActions {
//   export const getVaults = createAsyncThunk<
//     any[],
//     string | undefined,
//     ThunkAPI
//   >('vaults/getVaults', async (_arg, { extra }) => {
//     const { getSupportedVaults } = extra.services;
//     const supportedVaults = await getSupportedVaults.execute();
//     return supportedVaults;
//   });
// }
