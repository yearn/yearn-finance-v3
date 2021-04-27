import { createAction, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import { UserTokenData, UserVaultData, VaultData, VaultDynamicData } from '@types';
import BigNumber from 'bignumber.js';
import { TokensActions } from '@store';
import { formatUnits } from '@frameworks/ethers';

const setSelectedVaultAddress = createAction<{ vaultAddress: string }>('vaults/setSelectedVaultAddress');

const initiateSaveVaults = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'vaults/initiateSaveVaults',
  async (_arg, { dispatch }) => {
    await dispatch(getVaults());
  }
);

const getVaults = createAsyncThunk<
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

const getVaultsDynamic = createAsyncThunk<{ vaultsDynamicData: VaultDynamicData[] }, { addresses: string[] }, ThunkAPI>(
  'vaults/getVaultsDynamic',
  async ({ addresses }, { extra }) => {
    const { vaultService } = extra.services;
    const vaultsDynamicData = await vaultService.getVaultsDynamicData(addresses);
    return { vaultsDynamicData };
  }
);

const getUserVaultsData = createAsyncThunk<{ userVaultsMap: { [address: string]: UserVaultData } }, void, ThunkAPI>(
  'user/getUserVaultsData',
  async (_arg, { extra, getState, dispatch }) => {
    const { services } = extra;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const userVaultsData = await services.vaultService.getUserVaultsData({ userAddress });
    const userVaultsMap: { [address: string]: UserVaultData } = {};
    userVaultsData.forEach((vault) => {
      userVaultsMap[vault.address] = vault;
    });

    return { userVaultsMap };
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
    const tokenData = getState().tokens.tokensMap[vaultData.token];
    const userTokenData = getState().tokens.user.userTokensMap[vaultData.token];
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
    await vaultService.deposit({ tokenAddress: vaultData.token, vaultAddress, amount: amount.toFixed(0) });
    dispatch(getVaultsDynamic({ addresses: [vaultAddress] }));
    dispatch(getUserVaultsData());
    // dispatch(getUserVaultsData([vaultAddress])); // TODO use when suported by sdk.
    // dispatch(getUSerTokensData([vaultData.token])); // TODO use when suported by sdk
  }
);

const withdrawVault = createAsyncThunk<void, { vaultAddress: string; amount: BigNumber }, ThunkAPI>(
  'vaults/withdrawVault',
  async ({ vaultAddress, amount }, { extra, getState, dispatch }) => {
    const { services } = extra;
    const vaultData = getState().vaults.vaultsMap[vaultAddress];
    const tokenData = getState().tokens.tokensMap[vaultData.token];
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

    const sharePrice = formatUnits(vaultData.pricePerShare, decimals.toNumber());
    const amountOfShares = new BigNumber(amount).dividedBy(sharePrice).decimalPlaces(0).toFixed(0);

    const { vaultService } = services;
    await vaultService.withdraw({
      tokenAddress: vaultData.token,
      vaultAddress,
      amountOfShares,
    });
    dispatch(getVaultsDynamic({ addresses: [vaultAddress] }));
    dispatch(getUserVaultsData());
    // dispatch(getUserVaultsData([vaultAddress])); // TODO use when suported by sdk.
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
