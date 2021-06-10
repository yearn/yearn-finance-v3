import { createAction, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import BigNumber from 'bignumber.js';
import { TokensActions } from '@store';
import { Position, Vault, VaultDynamic } from '@types';
import {
  handleTransaction,
  calculateSharesAmount,
  normalizeAmount,
  toBN,
  validateVaultAllowance,
  validateVaultDeposit,
  validateVaultWithdraw,
  validateVaultWithdrawAllowance,
} from '@utils';

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
  const userAddress = getState().wallet.selectedAddress;
  if (!userAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  const vaultData = getState().vaults.vaultsMap[vaultAddress];
  const tokenData = getState().tokens.tokensMap[tokenAddress];
  const userTokenData = getState().tokens.user.userTokensMap[tokenAddress];
  const tokenAllowancesMap = getState().tokens.user.userTokensAllowancesMap[tokenAddress] ?? {};
  const decimals = toBN(tokenData.decimals);
  const ONE_UNIT = toBN('10').pow(decimals);
  const { error: depositError } = validateVaultDeposit({
    amount,
    depositLimit: vaultData?.metadata.depositLimit ?? '0',
    emergencyShutdown: vaultData?.metadata.emergencyShutdown || false,
    tokenDecimals: tokenData?.decimals ?? '0',
    userTokenBalance: userTokenData?.balance ?? '0',
  });
  const { error: allowanceError } = validateVaultAllowance({
    vaultUnderlyingTokenAddress: vaultData.tokenId,
    tokenAddress: tokenAddress,
    vaultAddress: vaultAddress,
    tokenDecimals: tokenData.decimals,
    tokenAllowancesMap,
    amount,
  });

  const error = depositError || allowanceError;
  if (error) throw new Error(error);

  const amountInWei = amount.multipliedBy(ONE_UNIT);
  const { vaultService } = services;
  const tx = await vaultService.deposit({
    accountAddress: userAddress,
    tokenAddress: tokenData.address,
    vaultAddress,
    amount: amountInWei.toString(),
  });
  await handleTransaction(tx);
  dispatch(getVaultsDynamic({ addresses: [vaultAddress] }));
  dispatch(getUserVaultsPositions({ vaultAddresses: [vaultAddress] }));
  dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, vaultAddress] }));
});

const withdrawVault = createAsyncThunk<
  void,
  { vaultAddress: string; amount: BigNumber; targetTokenAddress: string },
  ThunkAPI
>('vaults/withdrawVault', async ({ vaultAddress, amount, targetTokenAddress }, { extra, getState, dispatch }) => {
  const { services } = extra;
  const userAddress = getState().wallet.selectedAddress;
  if (!userAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  const vaultData = getState().vaults.vaultsMap[vaultAddress];
  const tokenData = getState().tokens.tokensMap[vaultData.tokenId];
  const vaultAllowancesMap = getState().tokens.user.userTokensAllowancesMap[vaultAddress];
  const userVaultData = getState().vaults.user.userVaultsPositionsMap[vaultAddress]?.DEPOSIT;

  const amountOfShares = calculateSharesAmount({
    amount,
    decimals: tokenData.decimals,
    pricePerShare: vaultData.metadata.pricePerShare,
  });

  const { error: allowanceError } = validateVaultWithdrawAllowance({
    amount: toBN(normalizeAmount(amountOfShares, parseInt(tokenData.decimals))),
    targetTokenAddress: targetTokenAddress,
    underlyingTokenAddress: tokenData.address ?? '',
    decimals: tokenData.decimals.toString() ?? '0',
    yvTokenAllowancesMap: vaultAllowancesMap ?? {},
  });

  const { error: withdrawError } = validateVaultWithdraw({
    amount: toBN(normalizeAmount(amountOfShares, parseInt(tokenData.decimals))),
    userYvTokenBalance: userVaultData.balance ?? '0',
    decimals: tokenData.decimals.toString() ?? '0', // check if its ok to use underlyingToken decimals as vault decimals
  });

  const error = withdrawError || allowanceError;
  if (error) throw new Error(error);

  const { vaultService } = services;
  const tx = await vaultService.withdraw({
    accountAddress: userAddress,
    tokenAddress: vaultData.tokenId,
    vaultAddress,
    amountOfShares,
  });
  await handleTransaction(tx);
  dispatch(getVaultsDynamic({ addresses: [vaultAddress] }));
  dispatch(getUserVaultsPositions({ vaultAddresses: [vaultAddress] }));
  // dispatch(getUSerTokensData([vaultData.token])); // TODO use when suported by sdk
});

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
