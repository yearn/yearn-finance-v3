import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkAPI } from '../../../frameworks/redux';
import { Lab, LabDynamic, Position } from '@types';
import { VaultsActions } from '../vaults/vaults.actions';
import { getConstants } from '../../../../config/constants';
import { TokensActions } from '../..';
import BigNumber from 'bignumber.js';
import { calculateSharesAmount, handleTransaction, toBN } from '../../../../utils';

const { THREECRV, YVECRV } = getConstants().CONTRACT_ADDRESSES;

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
    const labsData = await labService.getSupportedLabs();
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
    const YVTHREECRV = getConstants().CONTRACT_ADDRESSES.YVTHREECRV;
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
    const YVTHREECRV = getConstants().CONTRACT_ADDRESSES.YVTHREECRV;
    await dispatch(VaultsActions.getUserVaultsPositions({ vaultAddresses: [YVTHREECRV] }));
  }
);

const yvBoostApproveDeposit = createAsyncThunk<void, { labAddress: string; sellTokenAddress: string }, ThunkAPI>(
  'labs/yvBoost/yvBoostApproveDeposit',
  async ({ labAddress, sellTokenAddress }, { dispatch, getState }) => {
    try {
      const labData = getState().labs.labsMap[labAddress];
      const isZapin = labData.tokenId !== sellTokenAddress;
      const spenderAddress = isZapin ? getConstants().CONTRACT_ADDRESSES.zapIn : labAddress;
      const result = await dispatch(TokensActions.approve({ tokenAddress: sellTokenAddress, spenderAddress }));
      unwrapResult(result);
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

interface LabsDepositProps {
  labAddress: string;
  sellTokenAddress: string;
  amount: BigNumber;
}
const yvBoostDeposit = createAsyncThunk<void, LabsDepositProps, ThunkAPI>(
  'labs/yvBoost/yvBoostDeposit',
  async ({ labAddress, sellTokenAddress, amount }, { dispatch, getState, extra }) => {
    const { services } = extra;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const labData = getState().labs.labsMap[labAddress];
    const tokenData = getState().tokens.tokensMap[sellTokenAddress];
    const userTokenData = getState().tokens.user.userTokensMap[sellTokenAddress];
    const tokenAllowancesMap = getState().tokens.user.userTokensAllowancesMap[sellTokenAddress] ?? {};
    const decimals = toBN(tokenData.decimals);
    const ONE_UNIT = toBN('10').pow(decimals);

    // TODO validations

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
    dispatch(TokensActions.getUserTokens({ addresses: [sellTokenAddress, labAddress] }));
  }
);

const yvBoostApproveZapOut = createAsyncThunk<void, { labAddress: string }, ThunkAPI>(
  'labs/yvBoost/yvBoostApproveZapOut',
  async ({ labAddress }, { dispatch }) => {
    try {
      const ZAP_OUT_CONTRACT_ADDRESS = getConstants().CONTRACT_ADDRESSES.zapOut;
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
>('labs/yvBoost/yveCrvWithdraw', async ({ labAddress, amount, targetTokenAddress }, { dispatch, extra, getState }) => {
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

  // TODO validations

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

const yveCrvApproveDeposit = createAsyncThunk<void, { labAddress: string; tokenAddress: string }, ThunkAPI>(
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

const yveCrvDeposit = createAsyncThunk<void, LabsDepositProps, ThunkAPI>(
  'labs/yveCrv/yveCrvDeposit',
  async ({ labAddress, sellTokenAddress, amount }, { dispatch, getState, extra }) => {
    const { services } = extra;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const labData = getState().labs.labsMap[labAddress];
    const tokenData = getState().tokens.tokensMap[sellTokenAddress];
    const userTokenData = getState().tokens.user.userTokensMap[sellTokenAddress];
    const tokenAllowancesMap = getState().tokens.user.userTokensAllowancesMap[sellTokenAddress] ?? {};
    const decimals = toBN(tokenData.decimals);
    const ONE_UNIT = toBN('10').pow(decimals);

    // TODO validations

    const amountInWei = amount.multipliedBy(ONE_UNIT);
    const { labService } = services;
    // const tx = await labService.yveCrvDeposit({
    //   accountAddress: userAddress,
    //   tokenAddress: tokenData.address,
    //   labAddress,
    //   amount: amountInWei.toString(),
    // });
    // await handleTransaction(tx);
    dispatch(getLabsDynamic({ addresses: [labAddress] }));
    dispatch(getUserLabsPositions({ labsAddresses: [labAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [sellTokenAddress, labAddress] }));
  }
);

const yveCrvClaimReward = createAsyncThunk<void, void, ThunkAPI>(
  'labs/yveCrv/yveCrvClaimReward',
  async (_args, { dispatch, extra, getState }) => {
    const { services } = extra;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }

    // TODO validations.

    const { labService } = services;
    // const tx = await labService.yveCrvClaimReward({
    //   accountAddress: userAddress,
    // });
    // await handleTransaction(tx);
    dispatch(getLabsDynamic({ addresses: [YVECRV] }));
    dispatch(getUserLabsPositions({ labsAddresses: [YVECRV] }));
    dispatch(TokensActions.getUserTokens({ addresses: [THREECRV, YVECRV] }));
  }
);

const yveCrvApproveReinvest = createAsyncThunk<void, { labAddress: string; tokenAddress: string }, ThunkAPI>(
  'labs/yveCrv/yveCrvApproveReinvest',
  async ({ labAddress, tokenAddress }, { dispatch }) => {
    try {
      const result = await dispatch(TokensActions.approve({ tokenAddress, spenderAddress: labAddress }));
      unwrapResult(result);
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const yveCrvReinvest = createAsyncThunk<void, void, ThunkAPI>(
  'labs/yveCrv/yveCrvReinvest',
  async (_args, { dispatch, extra, getState }) => {
    const { services } = extra;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }

    // TODO validations.

    const { labService } = services;
    // const tx = await labService.yveCrvReinvest({
    //   accountAddress: userAddress,
    // });
    // await handleTransaction(tx);

    dispatch(getLabsDynamic({ addresses: [YVECRV] }));
    dispatch(getUserLabsPositions({ labsAddresses: [YVECRV] }));
    dispatch(TokensActions.getUserTokens({ addresses: [THREECRV] }));
    dispatch(getYveCrvExtraData({ fetchDynamicData: true }));
    dispatch(getUserYveCrvExtraData());
  }
);

const yvBoostEthApproveInvest = createAsyncThunk<void, void, ThunkAPI>(
  'labs/yvBoostEth/yvBoostEthApproveInvest',
  async (_args, { dispatch, extra, getState }) => {}
);

const yvBoostInvest = createAsyncThunk<void, void, ThunkAPI>(
  'labs/yvBoostEth/yvBoostInvest',
  async (_args, { dispatch, extra, getState }) => {}
);

const yvBoostApproveStake = createAsyncThunk<void, void, ThunkAPI>(
  'labs/yvBoostEth/yvBoostApproveStake',
  async (_args, { dispatch, extra, getState }) => {}
);

const yvBoostStake = createAsyncThunk<void, void, ThunkAPI>(
  'labs/yvBoostEth/yvBoostStake',
  async (_args, { dispatch, extra, getState }) => {}
);

export const LabsActions = {
  initiateLabs,
  getLabs,
  getLabsDynamic,
  getUserLabsPositions,
  getYveCrvExtraData,
  getUserYveCrvExtraData,
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
  yvBoostEth: {},
};
