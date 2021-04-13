import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '../../../frameworks/redux';
import { UserTokenData } from '../../../types/UserToken';
import { UserVaultData } from '../../../types/UserVault';

const setUserTokenData = createAction<{ userTokenData: UserTokenData }>('user/setUserTokenData');

const getUserVaultsData = createAsyncThunk<
  { userVaultsMap: { [address: string]: UserVaultData }; userTokensMap: { [address: string]: UserTokenData } },
  void,
  ThunkAPI
>('user/getUserVaultsData', async (_arg, { extra, getState }) => {
  const { services } = extra;
  const userAddress = getState().wallet.selectedAddress;
  if (!userAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  const userVaultsData = await services.userService.getUserVaultsData({ userAddress });
  const userVaultsMap: { [address: string]: UserVaultData } = {};
  const userTokensMap: { [address: string]: UserTokenData } = {}; // this should be removed when sdk.getTokens() ready.
  userVaultsData.forEach((vault) => {
    userVaultsMap[vault.address] = vault;
    userTokensMap[vault.tokenPosition.address] = vault.tokenPosition;
  });
  return { userVaultsMap, userTokensMap };
});

export const UserActions = {
  setUserTokenData,
  getUserVaultsData,
};
