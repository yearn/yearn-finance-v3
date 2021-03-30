import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '../../../frameworks/redux';
import { UserVaultData } from '../../../types/UserVault';

export const getUserVaultsData = createAsyncThunk<
  { userVaultsMap: { [address: string]: UserVaultData } },
  string | undefined,
  ThunkAPI
>('user/getUserVaultsData', async (_arg, { extra, getState }) => {
  const { services } = extra;
  const userAddress = getState().wallet.selectedAddress;
  const userVaultsData = await services.getUserVaults.execute(userAddress);
  const userVaultsMap: { [address: string]: UserVaultData } = {};
  userVaultsData.forEach((vault) => (userVaultsMap[vault.address] = vault));
  return { userVaultsMap };
});
