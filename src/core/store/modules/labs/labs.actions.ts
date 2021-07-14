import { createAction, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

import { ThunkAPI } from '@frameworks/redux';
import { Lab, LabDynamic, Position } from '@types';
import {
  calculateSharesAmount,
  handleTransaction,
  normalizeAmount,
  toBN,
  validateVaultAllowance,
  validateVaultDeposit,
  validateVaultWithdraw,
  validateVaultWithdrawAllowance,
  validateYvBoostEthActionsAllowance,
  getZapInContractAddress,
} from '@utils';
import { getConfig } from '@config';

import { VaultsActions } from '../vaults/vaults.actions';
import { AlertsActions, TokensActions } from '../..';

const { THREECRV, YVECRV, PSLPYVBOOSTETH, PSLPYVBOOSTETH_GAUGE } = getConfig().CONTRACT_ADDRESSES;

const setSelectedLabAddress = createAction<{ labAddress?: string }>('labs/setSelectedLabAddress');
const clearSelectedLabAndStatus = createAction<void>('labs/clearSelectedLabAndStatus');

const initiateLabs = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'labs/initiateLabs',
  async (_arg, { dispatch }) => {
    await dispatch(getLabs());
  }
);

const getLabs = createAsyncThunk<{ labsData: Lab[] }, void, ThunkAPI>(
  'labs/getLabs',
  async (_arg, { extra, dispatch }) => {
    const { labService } = extra.services;
    dispatch(getYveCrvExtraData({}));
    const { labsData, errors } = await labService.getSupportedLabs();
    errors.forEach((error) => {
      dispatch(AlertsActions.openAlert({ message: error, type: 'error', persistent: true }));
    });
    return { labsData };
  }
);

const getLabsDynamic = createAsyncThunk<{ labsDynamicData: LabDynamic[] }, { addresses: string[] }, ThunkAPI>(
  'labs/getLabsDynamic',
  async ({ addresses }, { extra, dispatch }) => {
    const { labService } = extra.services;
    const [labsDynamicData] = await Promise.all([
      labService.getLabsDynamicData(), // TODO pass addresses. waitint to xgaminto to merge his stuff to avoid conficts y lab service
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
  const { labService } = extra.services;
  const userAddress = getState().wallet.selectedAddress;
  if (!userAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  const [userLabsPositions] = await Promise.all([
    labService.getUserLabsPositions({ userAddress }), // TODO pass addresses. waitint to xgaminto to merge his stuff to avoid conficts y lab service
    dispatch(getUserYveCrvExtraData()),
  ]);
  return { userLabsPositions };
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
  slippageTolerance?: number;
}

interface ApproveWithdrawProps {
  labAddress: string;
}

interface WithdrawProps {
  labAddress: string;
  tokenAddress: string;
  amount: BigNumber;
  slippageTolerance?: number;
}

const approveDeposit = createAsyncThunk<void, ApproveDepositProps, ThunkAPI>(
  'labs/approveDeposit',
  async ({ labAddress, tokenAddress }, { dispatch, getState, extra }) => {
    const { labs } = getState();
    const labData = labs.labsMap[labAddress];
    const isZapin = tokenAddress !== labData.token || labAddress === PSLPYVBOOSTETH;
    const spenderAddress = isZapin ? getZapInContractAddress(labAddress) : labAddress;
    const result = await dispatch(TokensActions.approve({ tokenAddress, spenderAddress }));
    unwrapResult(result);
  }
);

const deposit = createAsyncThunk<void, DepositProps, ThunkAPI>(
  'labs/deposit',
  async ({ labAddress, tokenAddress, amount, slippageTolerance }, { dispatch, getState, extra }) => {
    const { services } = extra;
    const { labService } = services;
    const { wallet, labs, tokens } = getState();

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const labData = labs.labsMap[labAddress];
    const tokenData = tokens.tokensMap[tokenAddress];
    const userTokenData = tokens.user.userTokensMap[tokenAddress];
    const tokenAllowancesMap = tokens.user.userTokensAllowancesMap[tokenAddress] ?? {};
    const decimals = toBN(tokenData.decimals);
    const ONE_UNIT = toBN('10').pow(decimals);
    const amountInWei = amount.multipliedBy(ONE_UNIT);

    const { error: allowanceError } = validateVaultAllowance({
      amount,
      vaultAddress: labAddress,
      vaultUnderlyingTokenAddress: labData.tokenId,
      sellTokenAddress: tokenAddress,
      sellTokenDecimals: tokenData.decimals,
      sellTokenAllowancesMap: tokenAllowancesMap,
    });

    const { error: depositError } = validateVaultDeposit({
      sellTokenAmount: amount,
      depositLimit: labData?.metadata.depositLimit ?? '0',
      emergencyShutdown: labData?.metadata.emergencyShutdown || false,
      sellTokenDecimals: tokenData?.decimals ?? '0',
      userTokenBalance: userTokenData?.balance ?? '0',
      vaultUnderlyingBalance: labData?.underlyingTokenBalance.amount ?? '0',
    });

    const error = allowanceError || depositError;
    if (error) throw new Error(error);

    const tx = await labService.deposit({
      accountAddress: userAddress,
      tokenAddress: tokenData.address,
      vaultAddress: labAddress,
      amount: amountInWei.toString(),
      slippageTolerance,
    });
    await handleTransaction(tx);

    dispatch(getLabsDynamic({ addresses: [labAddress] }));
    dispatch(getUserLabsPositions({ labsAddresses: [labAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, labAddress] }));
  }
);

const approveWithdraw = createAsyncThunk<void, ApproveWithdrawProps, ThunkAPI>(
  'labs/approveWithdraw',
  async ({ labAddress }, { dispatch }) => {
    try {
      const ZAP_OUT_CONTRACT_ADDRESS = getConfig().CONTRACT_ADDRESSES.zapOut;
      const result = await dispatch(
        TokensActions.approve({ tokenAddress: labAddress, spenderAddress: ZAP_OUT_CONTRACT_ADDRESS })
      );
      unwrapResult(result);
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const withdraw = createAsyncThunk<void, WithdrawProps, ThunkAPI>(
  'labs/withdraw',
  async ({ labAddress, amount, tokenAddress, slippageTolerance }, { dispatch, extra, getState }) => {
    const { services } = extra;
    const { labService } = services;
    const { wallet, labs, tokens } = getState();

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const labData = labs.labsMap[labAddress];
    const tokenData = tokens.tokensMap[labData.tokenId];
    const labAllowancesMap = tokens.user.userTokensAllowancesMap[labAddress];
    const userLabData = labs.user.userLabsPositionsMap[labAddress]?.DEPOSIT;

    const amountOfShares = calculateSharesAmount({
      amount,
      decimals: tokenData.decimals,
      pricePerShare: labData.metadata.pricePerShare,
    });

    const { error: allowanceError } = validateVaultWithdrawAllowance({
      yvTokenAddress: labAddress,
      yvTokenAmount: toBN(normalizeAmount(amountOfShares, parseInt(tokenData.decimals))),
      targetTokenAddress: tokenAddress,
      underlyingTokenAddress: tokenData.address ?? '',
      yvTokenDecimals: tokenData.decimals.toString() ?? '0',
      yvTokenAllowancesMap: labAllowancesMap ?? {},
    });

    const { error: withdrawError } = validateVaultWithdraw({
      yvTokenAmount: toBN(normalizeAmount(amountOfShares, parseInt(tokenData.decimals))),
      userYvTokenBalance: userLabData.balance ?? '0',
      yvTokenDecimals: tokenData.decimals.toString() ?? '0', // check if its ok to use underlyingToken decimals as vault decimals
    });

    const error = withdrawError || allowanceError;
    if (error) throw new Error(error);

    const tx = await labService.withdraw({
      accountAddress: userAddress,
      tokenAddress: labData.tokenId,
      vaultAddress: labAddress,
      amountOfShares,
      slippageTolerance,
    });
    await handleTransaction(tx);

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
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const yvBoostDeposit = createAsyncThunk<void, DepositProps, ThunkAPI>(
  'labs/yvBoost/yvBoostDeposit',
  async ({ labAddress, tokenAddress, amount }, { dispatch, getState, extra }) => {
    const { services } = extra;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const labData = getState().labs.labsMap[labAddress];
    const tokenData = getState().tokens.tokensMap[tokenAddress];
    const userTokenData = getState().tokens.user.userTokensMap[tokenAddress];
    const tokenAllowancesMap = getState().tokens.user.userTokensAllowancesMap[tokenAddress] ?? {};
    const decimals = toBN(tokenData.decimals);
    const ONE_UNIT = toBN('10').pow(decimals);

    const { error: allowanceError } = validateVaultAllowance({
      amount,
      vaultAddress: labAddress,
      vaultUnderlyingTokenAddress: labData.tokenId,
      sellTokenAddress: tokenAddress,
      sellTokenDecimals: tokenData.decimals,
      sellTokenAllowancesMap: tokenAllowancesMap,
    });

    const { error: depositError } = validateVaultDeposit({
      sellTokenAmount: amount,
      depositLimit: labData?.metadata.depositLimit ?? '0',
      emergencyShutdown: labData?.metadata.emergencyShutdown || false,
      sellTokenDecimals: tokenData?.decimals ?? '0',
      userTokenBalance: userTokenData?.balance ?? '0',
      vaultUnderlyingBalance: labData?.underlyingTokenBalance.amount ?? '0',
    });
    const error = allowanceError || depositError;
    if (error) throw new Error(error);

    const amountInWei = amount.multipliedBy(ONE_UNIT);
    const { labService } = services;
    // const tx = await labService.yvBoostDeposit({
    //   accountAddress: userAddress,
    //   tokenAddress: tokenData.address,
    //   labAddress,
    //   amount: amountInWei.toString(),
    // });
    // await handleTransaction(tx);
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
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const yvBoostWithdraw = createAsyncThunk<
  void,
  { labAddress: string; amount: BigNumber; targetTokenAddress: string },
  ThunkAPI
>('labs/yvBoost/yvBoostWithdraw', async ({ labAddress, amount, targetTokenAddress }, { dispatch, extra, getState }) => {
  const { services } = extra;
  const userAddress = getState().wallet.selectedAddress;
  if (!userAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  const labData = getState().labs.labsMap[labAddress];
  const tokenData = getState().tokens.tokensMap[labData.tokenId];
  const labAllowancesMap = getState().tokens.user.userTokensAllowancesMap[labAddress];
  const userLabData = getState().labs.user.userLabsPositionsMap[labAddress]?.DEPOSIT;

  const amountOfShares = calculateSharesAmount({
    amount,
    decimals: tokenData.decimals,
    pricePerShare: labData.metadata.pricePerShare,
  });

  const { error: allowanceError } = validateVaultWithdrawAllowance({
    yvTokenAddress: labAddress,
    yvTokenAmount: toBN(normalizeAmount(amountOfShares, parseInt(tokenData.decimals))),
    targetTokenAddress: targetTokenAddress,
    underlyingTokenAddress: tokenData.address ?? '',
    yvTokenDecimals: tokenData.decimals.toString() ?? '0',
    yvTokenAllowancesMap: labAllowancesMap ?? {},
  });

  const { error: withdrawError } = validateVaultWithdraw({
    yvTokenAmount: toBN(normalizeAmount(amountOfShares, parseInt(tokenData.decimals))),
    userYvTokenBalance: userLabData.balance ?? '0',
    yvTokenDecimals: tokenData.decimals.toString() ?? '0', // check if its ok to use underlyingToken decimals as vault decimals
  });

  const error = withdrawError || allowanceError;
  if (error) throw new Error(error);

  const { labService } = services;
  // const tx = await labService.withdraw({
  //   accountAddress: userAddress,
  //   tokenAddress: labData.tokenId,
  //   labAddress,
  //   amountOfShares,
  // });
  // await handleTransaction(tx);

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
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const yveCrvDeposit = createAsyncThunk<void, DepositProps, ThunkAPI>(
  'labs/yveCrv/yveCrvDeposit',
  async ({ labAddress, tokenAddress, amount }, { dispatch, getState, extra }) => {
    const { services } = extra;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const labData = getState().labs.labsMap[labAddress];
    const tokenData = getState().tokens.tokensMap[tokenAddress];
    const userTokenData = getState().tokens.user.userTokensMap[tokenAddress];
    const tokenAllowancesMap = getState().tokens.user.userTokensAllowancesMap[tokenAddress] ?? {};
    const decimals = toBN(tokenData.decimals);
    const ONE_UNIT = toBN('10').pow(decimals);
    const amountInWei = amount.multipliedBy(ONE_UNIT);

    // TODO: validations

    const { labService } = services;
    const tx = await labService.lock({
      accountAddress: userAddress,
      tokenAddress: tokenData.address,
      vaultAddress: labAddress,
      amount: amountInWei.toString(),
    });
    await handleTransaction(tx);

    dispatch(getLabsDynamic({ addresses: [labAddress] }));
    dispatch(getUserLabsPositions({ labsAddresses: [labAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, labAddress] }));
  }
);

const yveCrvClaimReward = createAsyncThunk<void, void, ThunkAPI>(
  'labs/yveCrv/yveCrvClaimReward',
  async (_args, { dispatch, extra, getState }) => {
    const { services } = extra;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    // TODO validations.

    const { labService } = services;
    const tx = await labService.claim({
      accountAddress: userAddress,
    });
    await handleTransaction(tx);

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
    const { services } = extra;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    // TODO validations.

    const { labService } = services;
    const tx = await labService.reinvest({
      accountAddress: userAddress,
    });
    await handleTransaction(tx);

    dispatch(getLabsDynamic({ addresses: [YVECRV] }));
    dispatch(getUserLabsPositions({ labsAddresses: [YVECRV] }));
    dispatch(TokensActions.getUserTokens({ addresses: [THREECRV] }));
    dispatch(getYveCrvExtraData({ fetchDynamicData: true }));
    dispatch(getUserYveCrvExtraData());
  }
);

// -------------------- YVBOOST-ETH --------------------

const yvBoostEthApproveInvest = createAsyncThunk<void, ApproveDepositProps, ThunkAPI>(
  'labs/yvBoostEth/yvBoostEthApproveInvest',
  async ({ tokenAddress }, { dispatch }) => {
    // tokenAddress is anyToken.
    try {
      const result = await dispatch(
        TokensActions.approve({ tokenAddress, spenderAddress: getZapInContractAddress(PSLPYVBOOSTETH) })
      );
      unwrapResult(result);
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const yvBoostEthInvest = createAsyncThunk<void, DepositProps, ThunkAPI>(
  'labs/yvBoostEth/yvBoostEthInvest',
  async ({ labAddress, tokenAddress, amount }, { dispatch, extra, getState }) => {
    // labAddress is PSLPYVBOOSTETH
    const { services } = extra;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }

    const labData = getState().labs.labsMap[labAddress];
    const tokenData = getState().tokens.tokensMap[tokenAddress];
    const userTokenData = getState().tokens.user.userTokensMap[tokenAddress];
    const tokenAllowancesMap = getState().tokens.user.userTokensAllowancesMap[tokenAddress] ?? {};
    const decimals = toBN(tokenData.decimals);
    const ONE_UNIT = toBN('10').pow(decimals);

    const { error: allowanceError } = validateYvBoostEthActionsAllowance({
      action: 'INVEST',
      sellTokenAddress: tokenAddress,
      sellTokenAmount: amount,
      sellTokenDecimals: tokenData.decimals,
      sellTokenAllowancesMap: tokenAllowancesMap,
    });

    const { error: depositError } = validateVaultDeposit({
      sellTokenAmount: amount,
      sellTokenDecimals: tokenData?.decimals ?? '0',
      userTokenBalance: userTokenData?.balance ?? '0',
      vaultUnderlyingBalance: labData?.underlyingTokenBalance.amount ?? '0',
      depositLimit: labData?.metadata.depositLimit ?? '0',
      emergencyShutdown: labData?.metadata.emergencyShutdown || false,
    });

    const error = allowanceError || depositError;
    if (error) throw new Error(error);

    const { labService } = services;
    // const tx = await labService.yvBoostEthInvest({
    //   accountAddress: userAddress,
    //   tokenAddress: tokenData.address,
    //   amount: amountInWei.toString(),
    // });
    // await handleTransaction(tx);

    dispatch(getLabsDynamic({ addresses: [PSLPYVBOOSTETH] }));
    dispatch(getUserLabsPositions({ labsAddresses: [PSLPYVBOOSTETH] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, PSLPYVBOOSTETH] }));
  }
);

const yvBoostEthApproveStake = createAsyncThunk<void, { labAddress: string }, ThunkAPI>(
  'labs/yveCrv/yvBoostEthApproveStake',
  async (args, { dispatch }) => {
    try {
      const result = await dispatch(
        TokensActions.approve({ tokenAddress: PSLPYVBOOSTETH, spenderAddress: PSLPYVBOOSTETH_GAUGE })
      );
      unwrapResult(result);
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const yvBoostEthStake = createAsyncThunk<void, DepositProps, ThunkAPI>(
  'labs/yvBoostEth/yvBoostEthStake',
  async ({ labAddress, amount }, { dispatch, extra, getState }) => {
    const { services } = extra;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const tokenAddress = PSLPYVBOOSTETH;
    const labData = getState().labs.labsMap[labAddress];
    const tokenData = getState().tokens.tokensMap[tokenAddress];
    const userTokenData = getState().tokens.user.userTokensMap[tokenAddress];
    const tokenAllowancesMap = getState().tokens.user.userTokensAllowancesMap[tokenAddress] ?? {};
    const decimals = toBN(tokenData.decimals);
    const ONE_UNIT = toBN('10').pow(decimals);
    const amountInWei = amount.multipliedBy(ONE_UNIT);

    const { error: allowanceError } = validateYvBoostEthActionsAllowance({
      action: 'STAKE',
      sellTokenAddress: tokenAddress,
      sellTokenAmount: amount,
      sellTokenDecimals: tokenData.decimals,
      sellTokenAllowancesMap: tokenAllowancesMap,
    });

    const { error: depositError } = validateVaultDeposit({
      sellTokenAmount: amount,
      sellTokenDecimals: tokenData?.decimals ?? '0',
      userTokenBalance: userTokenData?.balance ?? '0',
      vaultUnderlyingBalance: labData?.underlyingTokenBalance.amount ?? '0',
      depositLimit: labData?.metadata.depositLimit ?? '0',
      emergencyShutdown: labData?.metadata.emergencyShutdown || false,
    });

    const error = allowanceError || depositError;
    if (error) throw new Error(error);

    const { labService } = services;
    const tx = await labService.stake({
      accountAddress: userAddress,
      tokenAddress: tokenData.address,
      vaultAddress: labAddress,
      amount: amountInWei.toString(),
    });
    await handleTransaction(tx);

    dispatch(getLabsDynamic({ addresses: [PSLPYVBOOSTETH] }));
    dispatch(getUserLabsPositions({ labsAddresses: [PSLPYVBOOSTETH] }));
    dispatch(TokensActions.getUserTokens({ addresses: [PSLPYVBOOSTETH] }));
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
  clearSelectedLabAndStatus,
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
  yvBoostEth: {
    yvBoostEthApproveInvest,
    yvBoostEthInvest,
    yvBoostEthApproveStake,
    yvBoostEthStake,
  },
};
