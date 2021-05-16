import { createAction, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import BigNumber from 'bignumber.js';
import { TokensActions } from '@store';
import { formatUnits } from '@frameworks/ethers';
import { Position, Vault, VaultDynamic } from '@types';

const setSelectedVaultAddress = createAction<{ vaultAddress: string }>('vaults/setSelectedVaultAddress');

const initiateSaveVaults = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'vaults/initiateSaveVaults',
  async (_arg, { dispatch }) => {
    await dispatch(getVaults());
  }
);

const getVaults = createAsyncThunk<{ vaultsData: Vault[] }, string | undefined, ThunkAPI>(
  'vaults/getVaults',
  async (_arg, { extra }) => {
    const { vaultService } = extra.services;
    const vaultsData = await vaultService.getSupportedVaults();
    return { vaultsData };
  }
);

const getVaultsDynamic = createAsyncThunk<{ vaultsDynamicData: VaultDynamic[] }, { addresses: string[] }, ThunkAPI>(
  'vaults/getVaultsDynamic',
  async ({ addresses }, { extra }) => {
    const { vaultService } = extra.services;
    const vaultsDynamicData = await vaultService.getVaultsDynamicData(addresses);
    return { vaultsDynamicData };
  }
);

const getUserVaultsData = createAsyncThunk<{ userVaultsData: Position[] }, { vaultAddresses?: string[] }, ThunkAPI>(
  'vaults/getUserVaultsData',
  async ({ vaultAddresses }, { extra, getState, dispatch }) => {
    const { services } = extra;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const userVaultsData = await services.vaultService.getUserVaultsData({ userAddress, vaultAddresses });
    return { userVaultsData };
  }
);

const approveVault = createAsyncThunk<void, { vaultAddress: string; tokenAddress: string }, ThunkAPI>(
  'vaults/approveVault',
  async ({ vaultAddress, tokenAddress }, { getState, dispatch }) => {
    try {
      const result = await dispatch(TokensActions.approve({ tokenAddress, spenderAddress: vaultAddress }));
      unwrapResult(result);
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const depositVault = createAsyncThunk<void, { vaultAddress: string; amount: BigNumber }, ThunkAPI>(
  'vaults/depositVault',
  async ({ vaultAddress, amount }, { extra, getState, dispatch }) => {
    const { services } = extra;
    const vaultData = getState().vaults.vaultsMap[vaultAddress];
    const tokenData = getState().tokens.tokensMap[vaultData.tokenId];
    const userTokenData = getState().tokens.user.userTokensMap[vaultData.tokenId];
    const decimals = new BigNumber(tokenData.decimals);
    const ONE_UNIT = new BigNumber(10).pow(decimals);
    amount = amount.multipliedBy(ONE_UNIT);
    // if (amount.lte(0)) {
    //   throw new Error('INVALID AMOUNT');
    // }
    // if (amount.gt(userTokenData.balance)) {
    //   throw new Error('INSUFICIENT FUNDS');
    // }

    const approved = new BigNumber(userTokenData.allowancesMap[vaultAddress]).gt(0);
    if (!approved) {
      await dispatch(approveVault({ vaultAddress, tokenAddress: tokenData.address }));
    }

    const { vaultService } = services;
    await vaultService.deposit({ tokenAddress: vaultData.tokenId, vaultAddress, amount: amount.toFixed(0) });
    dispatch(getVaultsDynamic({ addresses: [vaultAddress] }));
    dispatch(getUserVaultsData({ vaultAddresses: [vaultAddress] }));
    // dispatch(getUSerTokensData([vaultData.token])); // TODO use when suported by sdk
  }
);

const withdrawVault = createAsyncThunk<void, { vaultAddress: string; amount: BigNumber }, ThunkAPI>(
  'vaults/withdrawVault',
  async ({ vaultAddress, amount }, { extra, getState, dispatch }) => {
    const { services } = extra;
    const vaultData = getState().vaults.vaultsMap[vaultAddress];
    const tokenData = getState().tokens.tokensMap[vaultData.tokenId];
    // const userVaultData = getState().user.userVaultsMap[vaultAddress];
    const decimals = new BigNumber(tokenData.decimals);
    // const ONE_UNIT = new BigNumber(10).pow(decimals);
    // amount = amount.multipliedBy(ONE_UNIT);
    // if (amount.lte(0)) {
    //   throw new Error('INVALID AMOUNT');
    // }
    // if (amount.gt(userVaultData.depositedBalance)) {
    //   throw new Error('INSUFICIENT FUNDS');
    // }

    const sharePrice = formatUnits(vaultData.metadata.pricePerShare, decimals.toNumber());
    const amountOfShares = new BigNumber(amount).dividedBy(sharePrice).decimalPlaces(0).toFixed(0);

    const { vaultService } = services;
    await vaultService.withdraw({
      tokenAddress: vaultData.tokenId,
      vaultAddress,
      amountOfShares,
    });
    dispatch(getVaultsDynamic({ addresses: [vaultAddress] }));
    dispatch(getUserVaultsData({ vaultAddresses: [vaultAddress] }));
    // dispatch(getUSerTokensData([vaultData.token])); // TODO use when suported by sdk
  }
);

export const VaultsActions = {
  setSelectedVaultAddress,
  initiateSaveVaults,
  getVaults,
  approveVault,
  depositVault,
  withdrawVault,
  getVaultsDynamic,
  getUserVaultsData,
};
