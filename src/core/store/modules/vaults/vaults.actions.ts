import { createAction, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

import { ThunkAPI } from '@frameworks/redux';
import { TokensActions } from '@store';
import {
  Position,
  Vault,
  VaultDynamic,
  TransactionOutcome,
  VaultsUserSummary,
  VaultUserMetadata,
  Address,
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
  validateMigrateVaultAllowance,
} from '@utils';
import { getConfig } from '@config';

/* -------------------------------------------------------------------------- */
/*                                   Setters                                  */
/* -------------------------------------------------------------------------- */

const setSelectedVaultAddress = createAction<{ vaultAddress?: string }>('vaults/setSelectedVaultAddress');

/* -------------------------------------------------------------------------- */
/*                                 Clear State                                */
/* -------------------------------------------------------------------------- */

const clearVaultsData = createAction<void>('vaults/clearVaultsData');
const clearUserData = createAction<void>('vaults/clearUserData');
const clearTransactionData = createAction<void>('vaults/clearTransactionData');
const clearSelectedVaultAndStatus = createAction<void>('vaults/clearSelectedVaultAndStatus');
const clearVaultStatus = createAction<{ vaultAddress: string }>('vaults/clearVaultStatus');

/* -------------------------------------------------------------------------- */
/*                                 Fetch Data                                 */
/* -------------------------------------------------------------------------- */

const initiateSaveVaults = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'vaults/initiateSaveVaults',
  async (_arg, { dispatch }) => {
    await dispatch(getVaults({}));
  }
);

const getVaults = createAsyncThunk<{ vaultsData: Vault[] }, { addresses?: string[] }, ThunkAPI>(
  'vaults/getVaults',
  async ({ addresses }, { getState, extra }) => {
    const { network } = getState();
    const { vaultService } = extra.services;
    const vaultsData = await vaultService.getSupportedVaults({ network: network.current, addresses });
    return { vaultsData };
  }
);

const getVaultsDynamic = createAsyncThunk<{ vaultsDynamicData: VaultDynamic[] }, { addresses: string[] }, ThunkAPI>(
  'vaults/getVaultsDynamic',
  async ({ addresses }, { getState, extra }) => {
    const { network } = getState();
    const { vaultService } = extra.services;
    const vaultsDynamicData = await vaultService.getVaultsDynamicData({ network: network.current, addresses });
    return { vaultsDynamicData };
  }
);

const getUserVaultsPositions = createAsyncThunk<
  { userVaultsPositions: Position[] },
  { vaultAddresses?: string[] },
  ThunkAPI
>('vaults/getUserVaultsPositions', async ({ vaultAddresses }, { extra, getState }) => {
  const { network, wallet } = getState();
  const { services } = extra;
  const userAddress = wallet.selectedAddress;
  if (!userAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  const userVaultsPositions = await services.vaultService.getUserVaultsPositions({
    network: network.current,
    userAddress,
    vaultAddresses,
  });
  return { userVaultsPositions };
});

const getUserVaultsSummary = createAsyncThunk<{ userVaultsSummary: VaultsUserSummary }, void, ThunkAPI>(
  'vaults/getUserVaultsSummary',
  async (args, { extra, getState }) => {
    const { network, wallet } = getState();
    const { services } = extra;
    const userAddress = wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const userVaultsSummary = await services.vaultService.getUserVaultsSummary({
      network: network.current,
      userAddress,
    });
    return { userVaultsSummary };
  }
);

const getUserVaultsMetadata = createAsyncThunk<
  { userVaultsMetadata: VaultUserMetadata[] },
  { vaultsAddresses?: string[] },
  ThunkAPI
>('vaults/getUserVaultsMetadata', async ({ vaultsAddresses }, { extra, getState }) => {
  const { network, wallet } = getState();
  const { vaultService } = extra.services;
  const userAddress = wallet.selectedAddress;
  if (!userAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  const userVaultsMetadata = await vaultService.getUserVaultsMetadata({
    network: network.current,
    userAddress,
    vaultsAddresses,
  });

  return { userVaultsMetadata };
});

export interface GetExpectedTransactionOutcomeProps {
  transactionType: 'DEPOSIT' | 'WITHDRAW';
  sourceTokenAddress: Address;
  sourceTokenAmount: Wei;
  targetTokenAddress: Address;
}

const getExpectedTransactionOutcome = createAsyncThunk<
  { txOutcome: TransactionOutcome },
  GetExpectedTransactionOutcomeProps,
  ThunkAPI
>('vaults/getExpectedTransactionOutcome', async (getExpectedTxOutcomeProps, { getState, extra }) => {
  const { network } = getState();
  const { services } = extra;
  const { vaultService } = services;
  const { transactionType, sourceTokenAddress, sourceTokenAmount, targetTokenAddress } = getExpectedTxOutcomeProps;
  const accountAddress = getState().wallet.selectedAddress;
  if (!accountAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }

  const txOutcome = await vaultService.getExpectedTransactionOutcome({
    network: network.current,
    transactionType,
    accountAddress,
    sourceTokenAddress,
    sourceTokenAmount,
    targetTokenAddress,
  });
  return { txOutcome };
});

/* -------------------------------------------------------------------------- */
/*                             Transaction Methods                            */
/* -------------------------------------------------------------------------- */

const approveDeposit = createAsyncThunk<void, { vaultAddress: string; tokenAddress: string }, ThunkAPI>(
  'vaults/approveDeposit',
  async ({ vaultAddress, tokenAddress }, { dispatch, getState }) => {
    try {
      const vaultData = getState().vaults.vaultsMap[vaultAddress];
      const isZapin = vaultData.tokenId !== tokenAddress;
      const spenderAddress = isZapin ? getConfig().CONTRACT_ADDRESSES.zapIn : vaultAddress;
      const result = await dispatch(TokensActions.approve({ tokenAddress, spenderAddress }));
      unwrapResult(result);
    } catch (error: any) {
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
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

const depositVault = createAsyncThunk<
  void,
  {
    vaultAddress: string;
    tokenAddress: string;
    amount: BigNumber;
    targetUnderlyingTokenAmount: string | undefined;
    slippageTolerance?: number;
  },
  ThunkAPI
>(
  'vaults/depositVault',
  async (
    { vaultAddress, tokenAddress, amount, targetUnderlyingTokenAmount, slippageTolerance },
    { extra, getState, dispatch }
  ) => {
    const { network, wallet, vaults, tokens } = getState();
    const { services } = extra;
    const userAddress = wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const vaultData = vaults.vaultsMap[vaultAddress];
    const tokenData = tokens.tokensMap[tokenAddress];
    const userTokenData = tokens.user.userTokensMap[tokenAddress];
    const tokenAllowancesMap = tokens.user.userTokensAllowancesMap[tokenAddress] ?? {};
    const decimals = toBN(tokenData.decimals);
    const ONE_UNIT = toBN('10').pow(decimals);

    const { error: depositError } = validateVaultDeposit({
      sellTokenAmount: amount,
      depositLimit: vaultData?.metadata.depositLimit ?? '0',
      emergencyShutdown: vaultData?.metadata.emergencyShutdown || false,
      sellTokenDecimals: tokenData?.decimals ?? '0',
      userTokenBalance: userTokenData?.balance ?? '0',
      vaultUnderlyingBalance: vaultData?.underlyingTokenBalance.amount ?? '0',
      targetUnderlyingTokenAmount,
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
      network: network.current,
      accountAddress: userAddress,
      tokenAddress: tokenData.address,
      vaultAddress,
      amount: amountInWei.toString(),
      slippageTolerance,
    });
    await handleTransaction(tx, network.current);
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
    const { network, wallet, vaults, tokens } = getState();
    const { services } = extra;
    const userAddress = wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const vaultData = vaults.vaultsMap[vaultAddress];
    const tokenData = tokens.tokensMap[vaultData.tokenId];
    const vaultAllowancesMap = tokens.user.userTokensAllowancesMap[vaultAddress];
    const userVaultData = vaults.user.userVaultsPositionsMap[vaultAddress]?.DEPOSIT;

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
      network: network.current,
      accountAddress: userAddress,
      tokenAddress: targetTokenAddress,
      vaultAddress,
      amountOfShares,
      slippageTolerance,
    });
    await handleTransaction(tx, network.current);
    dispatch(getVaultsDynamic({ addresses: [vaultAddress] }));
    dispatch(getUserVaultsSummary());
    dispatch(getUserVaultsPositions({ vaultAddresses: [vaultAddress] }));
    dispatch(getUserVaultsMetadata({ vaultsAddresses: [vaultAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [targetTokenAddress, vaultAddress] }));
  }
);

const approveMigrate = createAsyncThunk<
  void,
  { vaultFromAddress: string; migrationContractAddress?: string },
  ThunkAPI
>('vaults/approveMigrate', async ({ vaultFromAddress, migrationContractAddress }, { dispatch }) => {
  const spenderAddress = migrationContractAddress ?? getConfig().CONTRACT_ADDRESSES.trustedVaultMigrator;
  const result = await dispatch(TokensActions.approve({ tokenAddress: vaultFromAddress, spenderAddress }));
  unwrapResult(result);
});

const migrateVault = createAsyncThunk<
  void,
  { vaultFromAddress: string; vaultToAddress: string; migrationContractAddress: string },
  ThunkAPI
>(
  'vaults/migrateVault',
  async ({ vaultFromAddress, vaultToAddress, migrationContractAddress }, { extra, getState, dispatch }) => {
    const { network, wallet, vaults, tokens } = getState();
    const { services, config } = extra;
    const { trustedVaultMigrator } = config.CONTRACT_ADDRESSES;
    const userAddress = wallet.selectedAddress;

    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const vaultData = vaults.vaultsMap[vaultFromAddress];
    const userDepositPositionData = vaults.user.userVaultsPositionsMap[vaultFromAddress].DEPOSIT;
    const tokenAllowancesMap = tokens.user.userTokensAllowancesMap[vaultFromAddress] ?? {};

    // TODO: ADD VALIDATION FOR VALID MIGRATABLE VAULTS AND WITH BALANCE

    const { error: allowanceError } = validateMigrateVaultAllowance({
      amount: toBN(userDepositPositionData.balance),
      vaultAddress: vaultFromAddress,
      vaultDecimals: vaultData.decimals,
      vaultAllowancesMap: tokenAllowancesMap,
      migrationContractAddress: migrationContractAddress ?? trustedVaultMigrator,
    });

    const error = allowanceError;
    if (error) throw new Error(error);

    const { vaultService } = services;
    const tx = await vaultService.migrate({
      network: network.current,
      accountAddress: userAddress,
      vaultFromAddress,
      vaultToAddress,
      migrationContractAddress: migrationContractAddress ?? trustedVaultMigrator,
    });

    await handleTransaction(tx, network.current);
    dispatch(getVaultsDynamic({ addresses: [vaultFromAddress, vaultToAddress] }));
    dispatch(getUserVaultsSummary());
    dispatch(getUserVaultsPositions({ vaultAddresses: [vaultFromAddress, vaultToAddress] }));
    dispatch(getUserVaultsMetadata({ vaultsAddresses: [vaultFromAddress, vaultToAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [vaultFromAddress, vaultToAddress] }));
  }
);

/* -------------------------------------------------------------------------- */
/*                                Subscriptions                               */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export const VaultsActions = {
  setSelectedVaultAddress,
  initiateSaveVaults,
  getVaults,
  approveDeposit,
  depositVault,
  approveZapOut,
  withdrawVault,
  approveMigrate,
  migrateVault,
  getVaultsDynamic,
  getUserVaultsPositions,
  initSubscriptions,
  clearVaultsData,
  clearUserData,
  getExpectedTransactionOutcome,
  clearTransactionData,
  getUserVaultsSummary,
  getUserVaultsMetadata,
  clearSelectedVaultAndStatus,
  clearVaultStatus,
};
