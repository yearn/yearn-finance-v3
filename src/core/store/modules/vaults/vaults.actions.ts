import { createAction, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import BigNumber from 'bignumber.js';
import { TokensActions } from '@store';
import { formatUnits } from '@frameworks/ethers';
import { Position, Vault, VaultDynamic } from '@types';
import { validateVaultAllowance, validateVaultDeposit } from '@src/utils';

const setSelectedVaultAddress = createAction<{ vaultAddress?: string }>('vaults/setSelectedVaultAddress');
const clearUserData = createAction<void>('vaults/clearUserData');

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

const getUserVaultsPositions = createAsyncThunk<
  { userVaultsPositions: Position[] },
  { vaultAddresses?: string[] },
  ThunkAPI
>('vaults/getUserVaultsPositions', async ({ vaultAddresses }, { extra, getState, dispatch }) => {
  const { services } = extra;
  const userAddress = getState().wallet.selectedAddress;
  if (!userAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  const userVaultsPositions = await services.vaultService.getUserVaultsPositions({ userAddress, vaultAddresses });
  return { userVaultsPositions };
});

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

const depositVault = createAsyncThunk<
  void,
  { vaultAddress: string; tokenAddress: string; amount: BigNumber },
  ThunkAPI
>('vaults/depositVault', async ({ vaultAddress, tokenAddress, amount }, { extra, getState, dispatch }) => {
  const { services } = extra;
  const vaultData = getState().vaults.vaultsMap[vaultAddress];
  const tokenData = getState().tokens.tokensMap[tokenAddress];
  const userTokenData = getState().tokens.user.userTokensMap[tokenAddress];
  const tokenAllowancesMap = getState().tokens.user.userTokensAllowancesMap[tokenAddress] ?? {};
  const decimals = new BigNumber(tokenData.decimals);
  const ONE_UNIT = new BigNumber(10).pow(decimals);
  const { error: depositError } = validateVaultDeposit({ vaultData, userTokenData, sellTokenData: tokenData, amount });
  const { error: allowanceError } = validateVaultAllowance({
    vaultAddress,
    sellTokenData: tokenData,
    tokenAllowancesMap,
    amount,
  });

  const error = depositError || allowanceError;
  if (error) throw new Error(error);

  const amountInWei = amount.multipliedBy(ONE_UNIT);
  const { vaultService } = services;
  await vaultService.deposit({ tokenAddress: tokenData.address, vaultAddress, amount: amountInWei.toString() });
  dispatch(getVaultsDynamic({ addresses: [vaultAddress] }));
  dispatch(getUserVaultsPositions({ vaultAddresses: [vaultAddress] }));
  dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, vaultAddress] }));
});

const withdrawVault = createAsyncThunk<void, { vaultAddress: string; amount: BigNumber }, ThunkAPI>(
  'vaults/withdrawVault',
  async ({ vaultAddress, amount }, { extra, getState, dispatch }) => {
    const { services } = extra;
    const vaultData = getState().vaults.vaultsMap[vaultAddress];
    const tokenData = getState().tokens.tokensMap[vaultData.tokenId];
    // const userVaultData = getState().vaults.user.userVaultsPositionsMap[vaultAddress]?.DEPOSIT;
    const decimals = new BigNumber(tokenData.decimals);
    // const ONE_UNIT = new BigNumber(10).pow(decimals);
    // amount = amount.multipliedBy(ONE_UNIT);
    // if (amount.lte(0)) {
    //   throw new Error('INVALID AMOUNT');
    // }
    // if (amount.gt(userVaultData.balance)) {
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
    dispatch(getUserVaultsPositions({ vaultAddresses: [vaultAddress] }));
    // dispatch(getUSerTokensData([vaultData.token])); // TODO use when suported by sdk
  }
);

const initSubscriptions = createAsyncThunk<void, void, ThunkAPI>(
  'vaults/initSubscriptions',
  async (_arg, { extra, dispatch }) => {
    const { subscriptionService } = extra.services;
    subscriptionService.subscribe({
      module: 'vaults',
      event: 'getDynamic',
      action: (vaultsAddresses: string[]) => {
        dispatch(getVaultsDynamic({ addresses: vaultsAddresses }));
      },
    });
    subscriptionService.subscribe({
      module: 'vaults',
      event: 'positionsOf',
      action: (vaultAddresses: string[]) => {
        dispatch(getUserVaultsPositions({ vaultAddresses }));
      },
    });
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
  getUserVaultsPositions,
  initSubscriptions,
  clearUserData,
};
