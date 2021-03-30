import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '../../../frameworks/redux';
import { VaultData } from '@types';
import { getUserVaultsData } from '@store';

export const initiateSaveVaults = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'vaults/initiateSaveVaults',
  async (_arg, { extra, dispatch, getState }) => {
    const { isConnected } = getState().wallet;
    const actionsList: Promise<any>[] = [dispatch(getVaults())];
    if (isConnected) {
      actionsList.push(dispatch(getUserVaultsData()));
      // actionsList.push(dispatch(getUserVaultsData()), dispatch(getUserTokensData()));
    }

    await Promise.all(actionsList);
  }
);

export const getVaults = createAsyncThunk<
  { vaultsMap: { [address: string]: VaultData }; vaultsAddreses: string[] },
  string | undefined,
  ThunkAPI
>('vaults/getVaults', async (_arg, { extra }) => {
  const { getSupportedVaults } = extra.services;
  const supportedVaults = await getSupportedVaults.execute();
  const vaultsMap: { [address: string]: VaultData } = {};
  const vaultsAddreses: string[] = [];
  supportedVaults.forEach((vault) => {
    vaultsMap[vault.address] = vault;
    vaultsAddreses.push(vault.address);
  });
  return { vaultsMap, vaultsAddreses };
});
