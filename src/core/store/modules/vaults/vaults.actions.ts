import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '../../../frameworks/redux';
import { VaultData } from '@types';
import BigNumber from 'bignumber.js';
import { setUserTokenData, getUserVaultsData } from '@store';
import { formatUnits } from '@frameworks/ethers';

export const setSelectedVaultAddress = createAction<{ vaultAddress: string }>('vaults/setSelectedVaultAddress');

export const initiateSaveVaults = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'vaults/initiateSaveVaults',
  async (_arg, { dispatch }) => {
    await dispatch(getVaults());
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
  async ({ vaultAddress }, { extra, getState, dispatch }) => {
    const { services, config } = extra;
    const vaultData = getState().vaults.vaultsMap[vaultAddress];
    const userTokenData = getState().user.userTokensMap[vaultData.token];
    const approved = new BigNumber(userTokenData.allowancesMap[vaultAddress]).gt(0);
    if (approved) {
      throw new Error('ALREADY_APPROVED');
    }

    const { vaultService } = services;
    await vaultService.approveDeposit({ tokenAddress: vaultData.token, vaultAddress, amount: config.MAX_UINT256 });

    const newUserTokendata = {
      ...userTokenData,
      allowancesMap: {
        ...userTokenData.allowancesMap,
        [vaultAddress]: config.MAX_UINT256,
      },
    };
    dispatch(setUserTokenData({ userTokenData: newUserTokendata }));
  }
);

export const depositVault = createAsyncThunk<void, { vaultAddress: string; amount: BigNumber }, ThunkAPI>(
  'vaults/depositVault',
  async ({ vaultAddress, amount }, { extra, getState, dispatch }) => {
    const { services } = extra;
    const vaultData = getState().vaults.vaultsMap[vaultAddress];
    const tokenData = getState().tokens.tokensMap[vaultData.token];
    const userTokenData = getState().user.userTokensMap[vaultData.token];
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
      await dispatch(approveVault({ vaultAddress }));
    }

    const { vaultService } = services;
    await vaultService.deposit({ tokenAddress: vaultData.token, vaultAddress, amount: amount.toFixed(0) });
    dispatch(getUserVaultsData());
    // dispatch(getUserVaultsData([vaultAddress])); // TODO use when suported by sdk.
    // dispatch(getUSerTokensData([vaultData.token])); // TODO use when suported by sdk
  }
);

export const withdrawVault = createAsyncThunk<void, { vaultAddress: string; amount: BigNumber }, ThunkAPI>(
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
    dispatch(getUserVaultsData());
    // dispatch(getUserVaultsData([vaultAddress])); // TODO use when suported by sdk.
    // dispatch(getUSerTokensData([vaultData.token])); // TODO use when suported by sdk
  }
);
