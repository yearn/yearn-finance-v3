import { createAction, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import BigNumber from 'bignumber.js';
import { TokensActions } from '@store';
import {
  Position,
  Vault,
  VaultDynamic,
  TransactionOutcome,
  VaultsUserSummary,
  VaultUserMetadata,
  EthereumAddress,
  Wei,
} from '@types';
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
import { getConfig } from '@config';
import { getConstants } from '../../../../config/constants';

const setSelectedVaultAddress = createAction<{ vaultAddress?: string }>('vaults/setSelectedVaultAddress');
const clearUserData = createAction<void>('vaults/clearUserData');
const clearTransactionData = createAction<void>('vaults/clearTransactionData');
const clearSelectedVaultAndStatus = createAction<void>('vaults/clearSelectedVaultAndStatus');

const initiateSaveVaults = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'vaults/initiateSaveVaults',
  async (_arg, { dispatch }) => {
    await dispatch(getVaults({}));
  }
);

const getVaults = createAsyncThunk<{ vaultsData: Vault[] }, { addresses?: string[] }, ThunkAPI>(
  'vaults/getVaults',
  async ({ addresses }, { extra }) => {
    const { vaultService } = extra.services;
    const vaultsData = await vaultService.getSupportedVaults({ addresses });
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

const getUserVaultsSummary = createAsyncThunk<{ userVaultsSummary: VaultsUserSummary }, void, ThunkAPI>(
  'vaults/getUserVaultsSummary',
  async (args, { extra, getState }) => {
    const { services } = extra;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const userVaultsSummary = await services.vaultService.getUserVaultsSummary({ userAddress });
    return { userVaultsSummary };
  }
);

const getUserVaultsMetadata = createAsyncThunk<
  { userVaultsMetadata: VaultUserMetadata[] },
  { vaultsAddresses?: string[] },
  ThunkAPI
>('vaults/getUserVaultsMetadata', async ({ vaultsAddresses }, { extra, getState }) => {
  const { vaultService } = extra.services;
  const userAddress = getState().wallet.selectedAddress;
  if (!userAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  const userVaultsMetadata = await vaultService.getUserVaultsMetadata({ userAddress, vaultsAddresses });

  return { userVaultsMetadata };
});

const approveDeposit = createAsyncThunk<void, { vaultAddress: string; tokenAddress: string }, ThunkAPI>(
  'vaults/approveDeposit',
  async ({ vaultAddress, tokenAddress }, { dispatch, getState }) => {
    try {
      const vaultData = getState().vaults.vaultsMap[vaultAddress];
      const isZapin = vaultData.tokenId !== tokenAddress;
      const spenderAddress = isZapin ? getConstants().CONTRACT_ADDRESSES.zapIn : vaultAddress;
      const result = await dispatch(TokensActions.approve({ tokenAddress, spenderAddress }));
      unwrapResult(result);
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const approveZapOut = createAsyncThunk<void, { vaultAddress: string }, ThunkAPI>(
  'vaults/approveZapOut',
  async ({ vaultAddress }, { dispatch }) => {
    try {
      const ZAP_OUT_CONTRACT_ADDRESS = getConfig().CONTRACT_ADDRESSES.zapOut;
      const result = await dispatch(
        TokensActions.approve({ tokenAddress: vaultAddress, spenderAddress: ZAP_OUT_CONTRACT_ADDRESS })
      );
      unwrapResult(result);
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const depositVault = createAsyncThunk<
  void,
  { vaultAddress: string; tokenAddress: string; amount: BigNumber; slippageTolerance?: number },
  ThunkAPI
>(
  'vaults/depositVault',
  async ({ vaultAddress, tokenAddress, amount, slippageTolerance }, { extra, getState, dispatch }) => {
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
      sellTokenAmount: amount,
      depositLimit: vaultData?.metadata.depositLimit ?? '0',
      emergencyShutdown: vaultData?.metadata.emergencyShutdown || false,
      sellTokenDecimals: tokenData?.decimals ?? '0',
      userTokenBalance: userTokenData?.balance ?? '0',
      vaultUnderlyingBalance: vaultData?.underlyingTokenBalance.amount ?? '0',
    });
    const { error: allowanceError } = validateVaultAllowance({
      amount,
      vaultAddress: vaultAddress,
      vaultUnderlyingTokenAddress: vaultData.tokenId,
      sellTokenAddress: tokenAddress,
      sellTokenDecimals: tokenData.decimals,
      sellTokenAllowancesMap: tokenAllowancesMap,
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
      slippageTolerance,
    });
    await handleTransaction(tx);
    dispatch(getVaultsDynamic({ addresses: [vaultAddress] }));
    dispatch(getUserVaultsSummary());
    dispatch(getUserVaultsPositions({ vaultAddresses: [vaultAddress] }));
    dispatch(getUserVaultsMetadata({ vaultsAddresses: [vaultAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, vaultAddress] }));
  }
);

const withdrawVault = createAsyncThunk<
  void,
  { vaultAddress: string; amount: BigNumber; targetTokenAddress: string; slippageTolerance?: number },
  ThunkAPI
>(
  'vaults/withdrawVault',
  async ({ vaultAddress, amount, targetTokenAddress, slippageTolerance }, { extra, getState, dispatch }) => {
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
      yvTokenAddress: vaultAddress,
      yvTokenAmount: toBN(normalizeAmount(amountOfShares, parseInt(tokenData.decimals))),
      targetTokenAddress: targetTokenAddress,
      underlyingTokenAddress: tokenData.address ?? '',
      yvTokenDecimals: tokenData.decimals.toString() ?? '0',
      yvTokenAllowancesMap: vaultAllowancesMap ?? {},
    });

    const { error: withdrawError } = validateVaultWithdraw({
      yvTokenAmount: toBN(normalizeAmount(amountOfShares, parseInt(tokenData.decimals))),
      userYvTokenBalance: userVaultData.balance ?? '0',
      yvTokenDecimals: tokenData.decimals.toString() ?? '0', // check if its ok to use underlyingToken decimals as vault decimals
    });

    const error = withdrawError || allowanceError;
    if (error) throw new Error(error);

    const { vaultService } = services;
    const tx = await vaultService.withdraw({
      accountAddress: userAddress,
      tokenAddress: vaultData.tokenId,
      vaultAddress,
      amountOfShares,
      slippageTolerance,
    });
    await handleTransaction(tx);
    dispatch(getVaultsDynamic({ addresses: [vaultAddress] }));
    dispatch(getUserVaultsSummary());
    dispatch(getUserVaultsPositions({ vaultAddresses: [vaultAddress] }));
    dispatch(getUserVaultsMetadata({ vaultsAddresses: [vaultAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [targetTokenAddress, vaultAddress] }));
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
        dispatch(getUserVaultsSummary());
        dispatch(getUserVaultsPositions({ vaultAddresses }));
        dispatch(getUserVaultsMetadata({ vaultsAddresses: vaultAddresses }));
      },
    });
  }
);

export interface GetExpectedTransactionOutcomeProps {
  transactionType: 'DEPOSIT' | 'WITHDRAW';
  sourceTokenAddress: EthereumAddress;
  sourceTokenAmount: Wei;
  targetTokenAddress: EthereumAddress;
}

const getExpectedTransactionOutcome = createAsyncThunk<
  { txOutcome: TransactionOutcome },
  GetExpectedTransactionOutcomeProps,
  ThunkAPI
>('vaults/getExpectedTransactionOutcome', async (getExpectedTxOutcomeProps, { dispatch, getState, extra }) => {
  const { services } = extra;
  const { vaultService } = services;
  const { transactionType, sourceTokenAddress, sourceTokenAmount, targetTokenAddress } = getExpectedTxOutcomeProps;
  const accountAddress = getState().wallet.selectedAddress;
  if (!accountAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }

  const txOutcome = await vaultService.getExpectedTransactionOutcome({
    transactionType,
    accountAddress,
    sourceTokenAddress,
    sourceTokenAmount,
    targetTokenAddress,
  });
  return { txOutcome };
});

export const VaultsActions = {
  setSelectedVaultAddress,
  initiateSaveVaults,
  getVaults,
  approveDeposit,
  depositVault,
  withdrawVault,
  getVaultsDynamic,
  getUserVaultsPositions,
  initSubscriptions,
  clearUserData,
  approveZapOut,
  getExpectedTransactionOutcome,
  clearTransactionData,
  getUserVaultsSummary,
  getUserVaultsMetadata,
  clearSelectedVaultAndStatus,
};
