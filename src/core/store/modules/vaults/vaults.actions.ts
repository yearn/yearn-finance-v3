import { createAction, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

import { ThunkAPI } from '@frameworks/redux';
import {
  Position,
  Vault,
  VaultDynamic,
  TransactionOutcome,
  VaultsUserSummary,
  VaultUserMetadata,
  Address,
  Wei,
  TokenAllowance,
} from '@types';
import {
  calculateSharesAmount,
  normalizeAmount,
  toBN,
  getNetwork,
  validateNetwork,
  validateVaultDeposit,
  validateVaultWithdraw,
  validateMigrateVaultAllowance,
  parseError,
} from '@utils';
import { getConfig } from '@config';

import { TokensActions } from '../tokens/tokens.actions';

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
>(
  'vaults/getExpectedTransactionOutcome',
  async (getExpectedTxOutcomeProps, { getState, extra }) => {
    const { network, app } = getState();
    const { services } = extra;
    const { vaultService } = services;
    const { transactionType, sourceTokenAddress, sourceTokenAmount, targetTokenAddress } = getExpectedTxOutcomeProps;

    const accountAddress = getState().wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const simulationsEnabled = app.servicesEnabled.simulations;
    if (!simulationsEnabled) throw new Error('SIMULATIONS DISABLED');

    const txOutcome = await vaultService.getExpectedTransactionOutcome({
      network: network.current,
      transactionType,
      accountAddress,
      sourceTokenAddress,
      sourceTokenAmount,
      targetTokenAddress,
    });

    return { txOutcome };
  },
  {
    serializeError: parseError,
  }
);

/* -------------------------------------------------------------------------- */
/*                             Transaction Methods                            */
/* -------------------------------------------------------------------------- */

const approveDeposit = createAsyncThunk<
  void,
  { vaultAddress: string; tokenAddress: string; gasless?: boolean },
  ThunkAPI
>(
  'vaults/approveDeposit',
  async ({ vaultAddress, tokenAddress, gasless }, { getState, dispatch, extra }) => {
    const { wallet, network } = getState();
    const { vaultService, transactionService } = extra.services;
    const amount = extra.config.MAX_UINT256;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const tx = await vaultService.approveDeposit({
      network: network.current,
      accountAddress,
      tokenAddress,
      vaultAddress,
      amount,
      gasless,
    });

    await transactionService.handleTransaction({ tx, network: network.current });

    await dispatch(getDepositAllowance({ tokenAddress, vaultAddress }));
  },
  {
    serializeError: parseError,
  }
);

const approveZapOut = createAsyncThunk<
  void,
  { vaultAddress: string; tokenAddress: string; gasless?: boolean },
  ThunkAPI
>(
  'vaults/approveZapOut',
  async ({ vaultAddress, tokenAddress, gasless }, { getState, dispatch, extra }) => {
    const { wallet, network } = getState();
    const { vaultService, transactionService } = extra.services;
    const amount = extra.config.MAX_UINT256;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const tx = await vaultService.approveWithdraw({
      network: network.current,
      accountAddress,
      amount,
      vaultAddress,
      tokenAddress,
      gasless,
    });

    await transactionService.handleTransaction({ tx, network: network.current });

    await dispatch(getWithdrawAllowance({ tokenAddress, vaultAddress }));
  },
  {
    serializeError: parseError,
  }
);

const signZapOut = createAsyncThunk<{ signature: string }, { vaultAddress: string; amount: BigNumber }, ThunkAPI>(
  'vaults/signZapOut',
  async ({ vaultAddress, amount }, { getState, extra }) => {
    const { network, wallet, vaults, tokens } = getState();
    const { vaultService } = extra.services;
    const { CONTRACT_ADDRESSES, MAX_UINT256 } = extra.config;

    const deadline = '0';

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const vaultData = vaults.vaultsMap[vaultAddress];
    const tokenData = tokens.tokensMap[vaultData.tokenId];
    const userVaultData = vaults.user.userVaultsPositionsMap[vaultAddress]?.DEPOSIT;

    const withdrawAll = amount.eq(MAX_UINT256);
    const amountOfShares = withdrawAll
      ? userVaultData.balance
      : calculateSharesAmount({
          amount,
          decimals: tokenData.decimals,
          pricePerShare: vaultData.metadata.pricePerShare,
        });

    const signature = await vaultService.signPermit({
      network: network.current,
      accountAddress,
      vaultAddress,
      spenderAddress: CONTRACT_ADDRESSES.zapOut,
      amount: amountOfShares,
      deadline,
    });

    return { signature };
  },
  {
    serializeError: parseError,
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
    const { network, wallet, vaults, tokens, app } = getState();
    const { services } = extra;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const vaultData = vaults.vaultsMap[vaultAddress];
    const tokenData = tokens.tokensMap[tokenAddress];
    const userTokenData = tokens.user.userTokensMap[tokenAddress];
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

    const error = depositError;
    if (error) throw new Error(error);

    const amountInWei = amount.multipliedBy(ONE_UNIT);
    const { vaultService, transactionService } = services;
    const tx = await vaultService.deposit({
      network: network.current,
      accountAddress: userAddress,
      tokenAddress,
      vaultAddress,
      amount: amountInWei.toString(),
      slippageTolerance,
    });
    const notificationsEnabled = app.servicesEnabled.notifications;
    await transactionService.handleTransaction({
      tx,
      network: network.current,
      useExternalService: notificationsEnabled,
    });
    dispatch(getVaultsDynamic({ addresses: [vaultAddress] }));
    dispatch(getUserVaultsSummary());
    dispatch(getUserVaultsPositions({ vaultAddresses: [vaultAddress] }));
    dispatch(getUserVaultsMetadata({ vaultsAddresses: [vaultAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, vaultAddress] }));
  },
  {
    serializeError: parseError,
  }
);

const withdrawVault = createAsyncThunk<
  void,
  {
    vaultAddress: string;
    amount: BigNumber;
    targetTokenAddress: string;
    slippageTolerance?: number;
    signature?: string;
  },
  ThunkAPI
>(
  'vaults/withdrawVault',
  async ({ vaultAddress, amount, targetTokenAddress, slippageTolerance, signature }, { extra, getState, dispatch }) => {
    const { network, wallet, vaults, tokens, app } = getState();
    const { services, config } = extra;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const vaultData = vaults.vaultsMap[vaultAddress];
    const tokenData = tokens.tokensMap[vaultData.tokenId];
    const userVaultData = vaults.user.userVaultsPositionsMap[vaultAddress]?.DEPOSIT;

    const withdrawAll = amount.eq(config.MAX_UINT256);
    const amountOfShares = withdrawAll
      ? userVaultData.balance
      : calculateSharesAmount({
          amount,
          decimals: tokenData.decimals,
          pricePerShare: vaultData.metadata.pricePerShare,
        });

    const { error: withdrawError } = validateVaultWithdraw({
      yvTokenAmount: toBN(normalizeAmount(amountOfShares, parseInt(tokenData.decimals))),
      userYvTokenBalance: userVaultData.balance ?? '0',
      yvTokenDecimals: tokenData.decimals.toString() ?? '0', // check if its ok to use underlyingToken decimals as vault decimals
    });

    const error = withdrawError;
    if (error) throw new Error(error);

    const { vaultService, transactionService } = services;
    const tx = await vaultService.withdraw({
      network: network.current,
      accountAddress: userAddress,
      tokenAddress: targetTokenAddress,
      vaultAddress,
      amountOfShares,
      slippageTolerance,
      signature,
    });
    const notificationsEnabled = app.servicesEnabled.notifications;
    await transactionService.handleTransaction({
      tx,
      network: network.current,
      useExternalService: notificationsEnabled,
    });
    dispatch(getVaultsDynamic({ addresses: [vaultAddress] }));
    dispatch(getUserVaultsSummary());
    dispatch(getUserVaultsPositions({ vaultAddresses: [vaultAddress] }));
    dispatch(getUserVaultsMetadata({ vaultsAddresses: [vaultAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [targetTokenAddress, vaultAddress] }));
  },
  {
    serializeError: parseError,
  }
);

const gaslessDeposit = createAsyncThunk<
  void,
  {
    vaultAddress: string;
    tokenAddress: string;
    minTargetAmount: Wei;
  },
  ThunkAPI
>(
  'vaults/gaslessDeposit',
  async ({ vaultAddress, tokenAddress, minTargetAmount }, { extra, getState, dispatch }) => {
    const { network, wallet } = getState();
    const { services } = extra;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const { vaultService } = services;
    const tx = await vaultService.gaslessDeposit({
      network: network.current,
      accountAddress,
      vaultAddress,
      tokenAddress,
      minTargetAmount,
    });

    // dispatch(getVaultsDynamic({ addresses: [vaultAddress] }));
    // dispatch(getUserVaultsSummary());
    // dispatch(getUserVaultsPositions({ vaultAddresses: [vaultAddress] }));
    // dispatch(getUserVaultsMetadata({ vaultsAddresses: [vaultAddress] }));
    // dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, vaultAddress] }));
  },
  {
    serializeError: parseError,
  }
);

const gaslessWithdraw = createAsyncThunk<
  void,
  {
    vaultAddress: string;
    tokenAddress: string;
    minTargetAmount: Wei;
  },
  ThunkAPI
>(
  'vaults/gaslessWithdraw',
  async ({ vaultAddress, tokenAddress, minTargetAmount }, { extra, getState, dispatch }) => {
    const { network, wallet } = getState();
    const { services } = extra;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const { vaultService } = services;
    const tx = await vaultService.gaslessWithdraw({
      network: network.current,
      accountAddress,
      vaultAddress,
      tokenAddress,
      minTargetAmount,
    });

    // dispatch(getVaultsDynamic({ addresses: [vaultAddress] }));
    // dispatch(getUserVaultsSummary());
    // dispatch(getUserVaultsPositions({ vaultAddresses: [vaultAddress] }));
    // dispatch(getUserVaultsMetadata({ vaultsAddresses: [vaultAddress] }));
    // dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, vaultAddress] }));
  },
  {
    serializeError: parseError,
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

const getDepositAllowance = createAsyncThunk<
  TokenAllowance,
  {
    tokenAddress: string;
    vaultAddress: string;
    gasless?: boolean;
  },
  ThunkAPI
>('vaults/getDepositAllowance', async ({ vaultAddress, tokenAddress, gasless }, { extra, getState, dispatch }) => {
  const {
    services: { vaultService },
  } = extra;
  const { network, wallet } = getState();
  const accountAddress = wallet.selectedAddress;

  if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

  const tokenAllowance = await vaultService.getDepositAllowance({
    network: network.current,
    vaultAddress,
    tokenAddress,
    accountAddress,
    gasless,
  });

  await dispatch(
    TokensActions.setTokenAllowance({
      tokenAddress,
      spenderAddress: tokenAllowance.spender,
      allowance: tokenAllowance.amount,
    })
  );

  return tokenAllowance;
});

const getWithdrawAllowance = createAsyncThunk<
  TokenAllowance,
  {
    tokenAddress: string;
    vaultAddress: string;
    gasless?: boolean;
  },
  ThunkAPI
>('vaults/getWithdrawAllowance', async ({ vaultAddress, tokenAddress, gasless }, { extra, getState, dispatch }) => {
  const {
    services: { vaultService },
  } = extra;
  const { network, wallet } = getState();
  const accountAddress = wallet.selectedAddress;

  if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

  const tokenAllowance = await vaultService.getWithdrawAllowance({
    network: network.current,
    vaultAddress,
    tokenAddress,
    accountAddress,
    gasless,
  });

  await dispatch(
    TokensActions.setTokenAllowance({
      tokenAddress: tokenAllowance.token,
      spenderAddress: tokenAllowance.spender,
      allowance: tokenAllowance.amount,
    })
  );

  return tokenAllowance;
});

const migrateVault = createAsyncThunk<
  void,
  { vaultFromAddress: string; vaultToAddress: string; migrationContractAddress: string },
  ThunkAPI
>(
  'vaults/migrateVault',
  async ({ vaultFromAddress, vaultToAddress, migrationContractAddress }, { extra, getState, dispatch }) => {
    const { network, wallet, vaults, tokens, app } = getState();
    const { services, config } = extra;
    const { trustedVaultMigrator } = config.CONTRACT_ADDRESSES;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const vaultData = vaults.vaultsMap[vaultFromAddress];
    const userDepositPositionData = vaults.user.userVaultsPositionsMap[vaultFromAddress].DEPOSIT;
    const tokenAllowancesMap = tokens.user.userTokensAllowancesMap[vaultFromAddress] ?? {};
    const migrationContractAddressToUse = migrationContractAddress ?? trustedVaultMigrator;

    // TODO: ADD VALIDATION FOR VALID MIGRATABLE VAULTS AND WITH BALANCE

    const { error: allowanceError } = validateMigrateVaultAllowance({
      amount: toBN(userDepositPositionData.balance),
      vaultAddress: vaultFromAddress,
      vaultDecimals: vaultData.decimals,
      vaultAllowancesMap: tokenAllowancesMap,
      migrationContractAddress: migrationContractAddressToUse,
    });

    const error = allowanceError;
    if (error) throw new Error(error);

    const { vaultService, transactionService } = services;
    const tx = await vaultService.migrate({
      network: network.current,
      accountAddress: userAddress,
      vaultFromAddress,
      vaultToAddress,
      migrationContractAddress: migrationContractAddressToUse,
    });

    const notificationsEnabled = app.servicesEnabled.notifications;
    await transactionService.handleTransaction({
      tx,
      network: network.current,
      useExternalService: notificationsEnabled,
    });
    dispatch(getVaultsDynamic({ addresses: [vaultFromAddress, vaultToAddress] }));
    dispatch(getUserVaultsSummary());
    dispatch(getUserVaultsPositions({ vaultAddresses: [vaultFromAddress, vaultToAddress] }));
    dispatch(getUserVaultsMetadata({ vaultsAddresses: [vaultFromAddress, vaultToAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [vaultFromAddress, vaultToAddress] }));
  },
  {
    serializeError: parseError,
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
  signZapOut,
  withdrawVault,
  gaslessDeposit,
  gaslessWithdraw,
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
  getDepositAllowance,
  getWithdrawAllowance,
};
