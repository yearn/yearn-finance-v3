import { createAction, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

import { ThunkAPI } from '@frameworks/redux';
import { Lab, LabDynamic, Position, TokenAllowance } from '@types';
import {
  toBN,
  getNetwork,
  validateNetwork,
  validateVaultDeposit,
  validateVaultWithdraw,
  validateYveCrvActionsAllowance,
  toWei,
  parseError,
} from '@utils';
import { getConfig } from '@config';

import { VaultsActions } from '../vaults/vaults.actions';
import { AlertsActions } from '../alerts/alerts.actions';
import { TokensActions } from '../tokens/tokens.actions';

const { THREECRV, YVECRV } = getConfig().CONTRACT_ADDRESSES;

const setSelectedLabAddress = createAction<{ labAddress?: string }>('labs/setSelectedLabAddress');
const clearLabsData = createAction<void>('labs/clearLabsData');
const clearSelectedLabAndStatus = createAction<void>('labs/clearSelectedLabAndStatus');
const clearLabStatus = createAction<{ labAddress: string }>('labs/clearLabStatus');
const clearUserData = createAction<void>('labs/clearUserData');

const initiateLabs = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'labs/initiateLabs',
  async (_arg, { dispatch }) => {
    await dispatch(getLabs());
  }
);

const getLabs = createAsyncThunk<{ labsData: Lab[] }, void, ThunkAPI>(
  'labs/getLabs',
  async (_arg, { getState, extra, dispatch }) => {
    const { network } = getState();
    const { labService } = extra.services;
    const { NETWORK_SETTINGS } = extra.config;

    if (!NETWORK_SETTINGS[network.current].labsEnabled) return { labsData: [] };

    dispatch(getYveCrvExtraData({}));
    const { labsData, errors } = await labService.getSupportedLabs({ network: network.current });
    errors.forEach((error) => {
      dispatch(AlertsActions.openAlert({ message: error, type: 'error', persistent: true }));
    });
    return { labsData };
  }
);

const getLabsDynamic = createAsyncThunk<{ labsDynamicData: LabDynamic[] }, { addresses: string[] }, ThunkAPI>(
  'labs/getLabsDynamic',
  async ({ addresses }, { getState, extra, dispatch }) => {
    const { network } = getState();
    const { labService } = extra.services;
    const { NETWORK_SETTINGS } = extra.config;

    if (!NETWORK_SETTINGS[network.current].labsEnabled) return { labsDynamicData: [] };

    const [labsDynamicData] = await Promise.all([
      labService.getLabsDynamicData({ network: network.current }), // TODO pass addresses. waitint to xgaminto to merge his stuff to avoid conficts y lab service
      dispatch(getYveCrvExtraData({ fetchDynamicData: true })),
    ]);
    return { labsDynamicData };
  }
);

const getUserLabsPositions = createAsyncThunk<
  { userLabsPositions: Position[] },
  { labsAddresses?: string[] },
  ThunkAPI
>('labs/getUserLabsPositions', async ({ labsAddresses }, { extra, getState, dispatch }) => {
  const { network, wallet } = getState();
  const { labService } = extra.services;
  const { NETWORK_SETTINGS } = extra.config;
  const userAddress = wallet.selectedAddress;

  if (!userAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  if (!NETWORK_SETTINGS[network.current].labsEnabled) return { userLabsPositions: [] };

  const [userLabsPositionsResponse] = await Promise.all([
    labService.getUserLabsPositions({ network: network.current, userAddress }), // TODO pass addresses. waitint to xgaminto to merge his stuff to avoid conficts y lab service
    dispatch(getUserYveCrvExtraData()),
  ]);
  const { positions, errors } = userLabsPositionsResponse;
  errors.forEach((error) => dispatch(AlertsActions.openAlert({ message: error, type: 'error', persistent: true })));
  return { userLabsPositions: positions };
});

const getYveCrvExtraData = createAsyncThunk<void, { fetchDynamicData?: boolean }, ThunkAPI>(
  'labs/getYveCrvExtraData',
  async ({ fetchDynamicData }, { dispatch }) => {
    const YVTHREECRV = getConfig().CONTRACT_ADDRESSES.YVTHREECRV;
    if (fetchDynamicData) {
      await dispatch(VaultsActions.getVaultsDynamic({ addresses: [YVTHREECRV] }));
      return;
    }
    await dispatch(VaultsActions.getVaults({ addresses: [YVTHREECRV] }));
  }
);

const getUserYveCrvExtraData = createAsyncThunk<void, void, ThunkAPI>(
  'labs/getUserYveCrvExtraData',
  async (_args, { dispatch }) => {
    const YVTHREECRV = getConfig().CONTRACT_ADDRESSES.YVTHREECRV;
    await dispatch(VaultsActions.getUserVaultsPositions({ vaultAddresses: [YVTHREECRV] }));
  }
);

// -------------------- GENERAL ACTIONS --------------------

interface ApproveDepositProps {
  labAddress: string;
  tokenAddress: string;
}

interface DepositProps {
  labAddress: string;
  tokenAddress: string;
  amount: BigNumber;
  targetUnderlyingTokenAmount: string | undefined;
  slippageTolerance?: number;
}

interface WithdrawProps {
  labAddress: string;
  tokenAddress: string;
  amount: BigNumber;
  slippageTolerance?: number;
}

const approveDeposit = createAsyncThunk<void, ApproveDepositProps, ThunkAPI>(
  'labs/approveDeposit',
  async ({ labAddress, tokenAddress }, { getState, dispatch, extra }) => {
    const { wallet, network } = getState();
    const { vaultService, transactionService } = extra.services;
    const amount = extra.config.MAX_UINT256;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const tx = await vaultService.approveDeposit({
      network: network.current,
      accountAddress,
      tokenAddress,
      vaultAddress: labAddress,
      amount,
    });

    await transactionService.handleTransaction({ tx, network: network.current });

    await dispatch(getDepositAllowance({ tokenAddress, labAddress }));
  },
  {
    serializeError: parseError,
  }
);

const getDepositAllowance = createAsyncThunk<
  TokenAllowance,
  {
    tokenAddress: string;
    labAddress: string;
  },
  ThunkAPI
>('labs/getDepositAllowance', async ({ labAddress, tokenAddress }, { extra, getState, dispatch }) => {
  const {
    services: { vaultService },
  } = extra;
  const { network, wallet } = getState();
  const accountAddress = wallet.selectedAddress;

  if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

  const tokenAllowance = await vaultService.getDepositAllowance({
    network: network.current,
    vaultAddress: labAddress,
    tokenAddress,
    accountAddress,
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

const deposit = createAsyncThunk<void, DepositProps, ThunkAPI>(
  'labs/deposit',
  async (
    { labAddress, tokenAddress, amount, slippageTolerance, targetUnderlyingTokenAmount },
    { dispatch, getState, extra }
  ) => {
    const { services } = extra;
    const { labService, transactionService } = services;
    const { wallet, labs, tokens, network, app } = getState();

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const labData = labs.labsMap[labAddress];
    const tokenData = tokens.tokensMap[tokenAddress];
    const userTokenData = tokens.user.userTokensMap[tokenAddress];
    const decimals = toBN(tokenData.decimals);
    const ONE_UNIT = toBN('10').pow(decimals);
    const amountInWei = amount.multipliedBy(ONE_UNIT);

    const { error: depositError } = validateVaultDeposit({
      sellTokenAmount: amount,
      depositLimit: labData?.metadata.depositLimit ?? '0',
      emergencyShutdown: labData?.metadata.emergencyShutdown || false,
      sellTokenDecimals: tokenData?.decimals ?? '0',
      userTokenBalance: userTokenData?.balance ?? '0',
      vaultUnderlyingBalance: labData?.underlyingTokenBalance.amount ?? '0',
      targetUnderlyingTokenAmount,
    });

    const error = depositError;
    if (error) throw new Error(error);

    const tx = await labService.deposit({
      network: network.current,
      accountAddress: userAddress,
      tokenAddress: tokenData.address,
      vaultAddress: labAddress,
      amount: amountInWei.toString(),
      slippageTolerance,
    });
    const notificationsEnabled = app.servicesEnabled.notifications;
    await transactionService.handleTransaction({
      tx,
      network: network.current,
      useExternalService: notificationsEnabled,
    });

    dispatch(getLabsDynamic({ addresses: [labAddress] }));
    dispatch(getUserLabsPositions({ labsAddresses: [labAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, labAddress] }));
  }
);

const approveWithdraw = createAsyncThunk<void, { labAddress: string; tokenAddress: string }, ThunkAPI>(
  'labs/approveWithdraw',
  async ({ labAddress, tokenAddress }, { getState, dispatch, extra }) => {
    const { wallet, network } = getState();
    const { vaultService, transactionService } = extra.services;
    const amount = extra.config.MAX_UINT256;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const tx = await vaultService.approveZapOut({
      network: network.current,
      accountAddress,
      amount,
      vaultAddress: labAddress,
      tokenAddress,
    });

    await transactionService.handleTransaction({ tx, network: network.current });

    await dispatch(getWithdrawAllowance({ tokenAddress, labAddress }));
  },
  {
    serializeError: parseError,
  }
);

const getWithdrawAllowance = createAsyncThunk<
  TokenAllowance,
  {
    tokenAddress: string;
    labAddress: string;
  },
  ThunkAPI
>('labs/getWithdrawAllowance', async ({ labAddress, tokenAddress }, { extra, getState, dispatch }) => {
  const {
    services: { vaultService },
  } = extra;
  const { network, wallet } = getState();
  const accountAddress = wallet.selectedAddress;

  if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

  const tokenAllowance = await vaultService.getWithdrawAllowance({
    network: network.current,
    vaultAddress: labAddress,
    tokenAddress,
    accountAddress,
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

const withdraw = createAsyncThunk<void, WithdrawProps, ThunkAPI>(
  'labs/withdraw',
  async ({ labAddress, amount, tokenAddress, slippageTolerance }, { dispatch, extra, getState }) => {
    const { services } = extra;
    const { labService, transactionService } = services;
    const { wallet, labs, network, app } = getState();

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const labData = labs.labsMap[labAddress];
    const userLabData = labs.user.userLabsPositionsMap[labAddress]?.DEPOSIT;

    // NOTE: We contemplate that in labs withdraw user always will be using yvToken instead of
    // underlyingToken like in vaults. Thats why amount is in yvToken already and we dont need
    // to calculate shares amount.
    const amountOfShares = toWei(amount.toString(), parseInt(labData.decimals));

    const { error: withdrawError } = validateVaultWithdraw({
      yvTokenAmount: amount, // normalized
      userYvTokenBalance: userLabData.balance ?? '0',
      yvTokenDecimals: labData.decimals ?? '0',
    });

    const error = withdrawError;
    if (error) throw new Error(error);

    const tx = await labService.withdraw({
      network: network.current,
      accountAddress: userAddress,
      tokenAddress: labData.tokenId,
      vaultAddress: labAddress,
      amountOfShares,
      slippageTolerance,
    });
    const notificationsEnabled = app.servicesEnabled.notifications;
    await transactionService.handleTransaction({
      tx,
      network: network.current,
      useExternalService: notificationsEnabled,
    });

    dispatch(getLabsDynamic({ addresses: [labAddress] }));
    dispatch(getUserLabsPositions({ labsAddresses: [labAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, labAddress] }));
  }
);

// -------------------- YVBOOST --------------------

const yvBoostApproveDeposit = createAsyncThunk<void, ApproveDepositProps, ThunkAPI>(
  'labs/yvBoost/yvBoostApproveDeposit',
  async ({ labAddress, tokenAddress }, { dispatch, getState }) => {
    try {
      const labData = getState().labs.labsMap[labAddress];
      const isZapin = labData.tokenId !== tokenAddress;
      const spenderAddress = isZapin ? getConfig().CONTRACT_ADDRESSES.zapIn : labAddress;
      const result = await dispatch(TokensActions.approve({ tokenAddress: tokenAddress, spenderAddress }));
      unwrapResult(result);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

const yvBoostDeposit = createAsyncThunk<void, DepositProps, ThunkAPI>(
  'labs/yvBoost/yvBoostDeposit',
  async ({ labAddress, tokenAddress, amount, targetUnderlyingTokenAmount }, { dispatch, getState }) => {
    const { wallet } = getState();
    const userAddress = wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const labData = getState().labs.labsMap[labAddress];
    const tokenData = getState().tokens.tokensMap[tokenAddress];
    const userTokenData = getState().tokens.user.userTokensMap[tokenAddress];

    const { error: depositError } = validateVaultDeposit({
      sellTokenAmount: amount,
      depositLimit: labData?.metadata.depositLimit ?? '0',
      emergencyShutdown: labData?.metadata.emergencyShutdown || false,
      sellTokenDecimals: tokenData?.decimals ?? '0',
      userTokenBalance: userTokenData?.balance ?? '0',
      vaultUnderlyingBalance: labData?.underlyingTokenBalance.amount ?? '0',
      targetUnderlyingTokenAmount,
    });

    const error = depositError;
    if (error) throw new Error(error);

    // const amountInWei = amount.multipliedBy(ONE_UNIT);
    // const { labService } = services;
    // const tx = await labService.yvBoostDeposit({
    //   accountAddress: userAddress,
    //   tokenAddress: tokenData.address,
    //   labAddress,
    //   amount: amountInWei.toString(),
    // });
    // await transactionService.handleTransaction(tx, network.current);
    dispatch(getLabsDynamic({ addresses: [labAddress] }));
    dispatch(getUserLabsPositions({ labsAddresses: [labAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, labAddress] }));
  }
);

const yvBoostApproveZapOut = createAsyncThunk<void, { labAddress: string }, ThunkAPI>(
  'labs/yvBoost/yvBoostApproveZapOut',
  async ({ labAddress }, { dispatch }) => {
    try {
      const ZAP_OUT_CONTRACT_ADDRESS = getConfig().CONTRACT_ADDRESSES.zapOut;
      const result = await dispatch(
        TokensActions.approve({ tokenAddress: labAddress, spenderAddress: ZAP_OUT_CONTRACT_ADDRESS })
      );
      unwrapResult(result);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

const yvBoostWithdraw = createAsyncThunk<
  void,
  { labAddress: string; amount: BigNumber; targetTokenAddress: string },
  ThunkAPI
>('labs/yvBoost/yvBoostWithdraw', async ({ labAddress, amount, targetTokenAddress }, { dispatch, getState }) => {
  const { wallet } = getState();
  const userAddress = wallet.selectedAddress;
  if (!userAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  const labData = getState().labs.labsMap[labAddress];
  const userLabData = getState().labs.user.userLabsPositionsMap[labAddress]?.DEPOSIT;

  // NOTE: We contemplate that in yvBoost withdraw user always will be using yvToken instead of
  // underlyingToken like in vaults. Thats why amount is in yvToken already and we dont need
  // to calculate shares amount.
  // const amountOfShares = toWei(amount.toString(), parseInt(labData.decimals));

  const { error: withdrawError } = validateVaultWithdraw({
    yvTokenAmount: amount, // normalized
    userYvTokenBalance: userLabData.balance ?? '0',
    yvTokenDecimals: labData.decimals ?? '0', // check if its ok to use underlyingToken decimals as vault decimals
  });

  const error = withdrawError;
  if (error) throw new Error(error);

  // const { labService } = services;
  // const tx = await labService.withdraw({
  //   accountAddress: userAddress,
  //   tokenAddress: labData.tokenId,
  //   labAddress,
  //   amountOfShares,
  // });
  // await transactionService.handleTransaction(tx, network.current);

  dispatch(getLabsDynamic({ addresses: [labAddress] }));
  dispatch(getUserLabsPositions({ labsAddresses: [labAddress] }));
  dispatch(TokensActions.getUserTokens({ addresses: [targetTokenAddress, labAddress] }));
});

// -------------------- BACKSCRATCHER --------------------

const yveCrvApproveDeposit = createAsyncThunk<void, ApproveDepositProps, ThunkAPI>(
  'labs/yveCrv/yveCrvApproveDeposit',
  async ({ labAddress, tokenAddress }, { dispatch }) => {
    try {
      const result = await dispatch(TokensActions.approve({ tokenAddress, spenderAddress: labAddress }));
      unwrapResult(result);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

const yveCrvDeposit = createAsyncThunk<void, DepositProps, ThunkAPI>(
  'labs/yveCrv/yveCrvDeposit',
  async ({ labAddress, tokenAddress, amount }, { dispatch, getState, extra }) => {
    const { network, wallet, app } = getState();
    const { services } = extra;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const tokenData = getState().tokens.tokensMap[tokenAddress];
    const decimals = toBN(tokenData.decimals);
    const ONE_UNIT = toBN('10').pow(decimals);
    const amountInWei = amount.multipliedBy(ONE_UNIT);

    // TODO: validations
    const { labService, transactionService } = services;

    const tx = await labService.lock({
      network: network.current,
      accountAddress: userAddress,
      tokenAddress: tokenData.address,
      vaultAddress: labAddress,
      amount: amountInWei.toString(),
    });
    const notificationsEnabled = app.servicesEnabled.notifications;
    await transactionService.handleTransaction({
      tx,
      network: network.current,
      useExternalService: notificationsEnabled,
    });

    dispatch(getLabsDynamic({ addresses: [labAddress] }));
    dispatch(getUserLabsPositions({ labsAddresses: [labAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, labAddress] }));
  }
);

const yveCrvClaimReward = createAsyncThunk<void, void, ThunkAPI>(
  'labs/yveCrv/yveCrvClaimReward',
  async (_args, { dispatch, extra, getState }) => {
    const { network, wallet, app } = getState();
    const { services } = extra;
    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    // TODO validations.

    const { labService, transactionService } = services;
    const tx = await labService.claim({
      network: network.current,
      accountAddress: userAddress,
    });
    const notificationsEnabled = app.servicesEnabled.notifications;
    await transactionService.handleTransaction({
      tx,
      network: network.current,
      useExternalService: notificationsEnabled,
    });

    dispatch(getLabsDynamic({ addresses: [YVECRV] }));
    dispatch(getUserLabsPositions({ labsAddresses: [YVECRV] }));
    dispatch(TokensActions.getUserTokens({ addresses: [THREECRV, YVECRV] }));
  }
);

const yveCrvApproveReinvest = createAsyncThunk<void, { labAddress: string; tokenAddress: string }, ThunkAPI>(
  'labs/yveCrv/yveCrvApproveReinvest',
  async ({ labAddress, tokenAddress }, { dispatch }) => {
    const { CONTRACT_ADDRESSES } = getConfig();
    const { THREECRV, y3CrvBackZapper } = CONTRACT_ADDRESSES;
    const result = await dispatch(TokensActions.approve({ tokenAddress: THREECRV, spenderAddress: y3CrvBackZapper }));
    unwrapResult(result);
  }
);

const yveCrvReinvest = createAsyncThunk<void, void, ThunkAPI>(
  'labs/yveCrv/yveCrvReinvest',
  async (_args, { dispatch, extra, getState }) => {
    const { network, wallet, app } = getState();
    const { services } = extra;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const tokenData = getState().tokens.tokensMap[THREECRV];
    const tokenAllowancesMap = getState().tokens.user.userTokensAllowancesMap[THREECRV];
    const amount = getState().labs.user.userLabsPositionsMap[YVECRV].YIELD.underlyingTokenBalance.amount;

    const { error: allowanceError } = validateYveCrvActionsAllowance({
      action: 'REINVEST',
      labAddress: YVECRV,
      sellTokenAmount: toBN(amount),
      sellTokenAddress: tokenData.address,
      sellTokenDecimals: tokenData.decimals.toString(),
      sellTokenAllowancesMap: tokenAllowancesMap,
    });

    // TODO validations for action.

    const error = allowanceError;
    if (error) throw new Error(error);

    const { labService, transactionService } = services;
    const tx = await labService.reinvest({
      network: network.current,
      accountAddress: userAddress,
    });
    const notificationsEnabled = app.servicesEnabled.notifications;
    await transactionService.handleTransaction({
      tx,
      network: network.current,
      useExternalService: notificationsEnabled,
    });

    dispatch(getLabsDynamic({ addresses: [YVECRV] }));
    dispatch(getUserLabsPositions({ labsAddresses: [YVECRV] }));
    dispatch(TokensActions.getUserTokens({ addresses: [THREECRV] }));
    dispatch(getYveCrvExtraData({ fetchDynamicData: true }));
    dispatch(getUserYveCrvExtraData());
  }
);

// ----------------------------------------

export const LabsActions = {
  initiateLabs,
  getLabs,
  getLabsDynamic,
  getUserLabsPositions,
  getYveCrvExtraData,
  getUserYveCrvExtraData,
  setSelectedLabAddress,
  approveDeposit,
  deposit,
  approveWithdraw,
  withdraw,
  clearLabsData,
  clearSelectedLabAndStatus,
  clearLabStatus,
  clearUserData,
  getDepositAllowance,
  getWithdrawAllowance,
  yvBoost: {
    yvBoostApproveDeposit,
    yvBoostDeposit,
    yvBoostApproveZapOut,
    yvBoostWithdraw,
  },
  yveCrv: {
    yveCrvApproveDeposit,
    yveCrvDeposit,
    yveCrvClaimReward,
    yveCrvApproveReinvest,
    yveCrvReinvest,
  },
};
