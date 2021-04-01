import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '../../../frameworks/redux';
import { VaultData } from '@types';
import { getUserVaultsData } from '@store';
import BigNumber from 'bignumber.js';

export const setSelectedVaultAddress = createAction<{ vaultAddress: string }>('vaults/setSelectedVaultAddress');

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
  const { vaultService } = extra.services;
  const supportedVaults = await vaultService.getSupportedVaults();
  const vaultsMap: { [address: string]: VaultData } = {};
  const vaultsAddreses: string[] = [];
  supportedVaults.forEach((vault) => {
    vaultsMap[vault.address] = vault;
    vaultsAddreses.push(vault.address);
  });
  return { vaultsMap, vaultsAddreses };
});

export const approveVault = createAsyncThunk<void, { vaultAddress: string }, ThunkAPI>(
  'vaults/approveVault',
  async ({ vaultAddress }, { extra, getState }) => {
    const vaultData = getState().vaults.vaultsMap[vaultAddress];
    const userTokenData = getState().user.userTokensMap[vaultData.token];

    const approved = new BigNumber(userTokenData.allowancesMap[vaultAddress]).gt(0);
    if (approved) {
      throw new Error('ALREADY_APPROVED');
    }

    // const { approveVault } = extra.services;
    // await approveVault.execute({ tokenAddress: vaultData.token, spender: vaultAddress});
  }
);

export const depositVault = createAsyncThunk<void, { vaultAddress: string; amount: BigNumber }, ThunkAPI>(
  'vaults/depositVault',
  async ({ vaultAddress, amount }, { extra, getState, dispatch }) => {
    const vaultData = getState().vaults.vaultsMap[vaultAddress];
    const tokenData = getState().tokens.tokensMap[vaultData.token];
    const userTokenData = getState().user.userTokensMap[vaultData.token];
    const decimals = new BigNumber(tokenData.decimals);
    const ONE_UNIT = new BigNumber(10).pow(decimals);
    amount = amount.multipliedBy(ONE_UNIT);
    if (amount.lte(0)) {
      throw new Error('INVALID AMOUNT');
    }
    if (amount.gt(userTokenData.balance)) {
      throw new Error('INSUFICIENT FUNDS');
    }

    const approved = new BigNumber(userTokenData.allowancesMap[vaultAddress]).gt(0);
    if (!approved) {
      await dispatch(approveVault({ vaultAddress }));
    }

    // const { depositVault } = extra.services;
    // await depositVault.execute(vaultAddress, amount); // TODO
  }
);

export const withdrawVault = createAsyncThunk<void, { vaultAddress: string; amount: BigNumber }, ThunkAPI>(
  'vaults/withdrawVault',
  async ({ vaultAddress, amount }, { extra, getState, dispatch }) => {
    const vaultData = getState().vaults.vaultsMap[vaultAddress];
    const tokenData = getState().tokens.tokensMap[vaultData.token];
    const userVaultData = getState().user.userVaultsMap[vaultAddress];
    const decimals = new BigNumber(tokenData.decimals);
    const ONE_UNIT = new BigNumber(10).pow(decimals);
    amount = amount.multipliedBy(ONE_UNIT);
    if (amount.lte(0)) {
      throw new Error('INVALID AMOUNT');
    }
    if (amount.gt(userVaultData.depositedBalance)) {
      throw new Error('INSUFICIENT FUNDS');
    }

    // const { withdrawVault } = extra.services;
    // await withdrawVault.execute(vaultAddress, amount); // TODO
  }
);
