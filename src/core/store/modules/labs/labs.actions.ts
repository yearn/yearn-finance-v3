import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '../../../frameworks/redux';
import { Lab, LabDynamic, Position } from '@types';
import { VaultsActions } from '../vaults/vaults.actions';
import { getConstants } from '../../../../config/constants';

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
    dispatch(getYveCrvExtraData({ fetchDynamicData: true }));
    // const labsDynamicData = await labService.getLabsDynamicData(addresses); // TODO pass addresses. waitint to xgaminto to merge his stuff to avoid conficts y lab service
    const labsDynamicData = await labService.getLabsDynamicData();
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
  dispatch(getUserYveCrvExtraData());
  // const userLabsPositions = await labService.getUserLabsPositions({ userAddress, labsAddresses });
  const userLabsPositions = await labService.getUserLabsPositions({ userAddress }); // TODO pass addresses. waitint to xgaminto to merge his stuff to avoid conficts y lab service
  return { userLabsPositions };
});

const getYveCrvExtraData = createAsyncThunk<void, { fetchDynamicData?: boolean }, ThunkAPI>(
  'labs/getYveCrvExtraData',
  async ({ fetchDynamicData }, { dispatch }) => {
    const YVTHREECRV = getConstants().CONTRACT_ADDRESSES.YVTHREECRV;
    if (fetchDynamicData) {
      dispatch(VaultsActions.getVaultsDynamic({ addresses: [YVTHREECRV] }));
      return;
    }
    dispatch(VaultsActions.getVaults({ addresses: [YVTHREECRV] }));
  }
);

const getUserYveCrvExtraData = createAsyncThunk<void, void, ThunkAPI>(
  'labs/getUserYveCrvExtraData',
  async (_args, { dispatch }) => {
    const YVTHREECRV = getConstants().CONTRACT_ADDRESSES.YVTHREECRV;
    dispatch(VaultsActions.getUserVaultsPositions({ vaultAddresses: [YVTHREECRV] }));
  }
);

export const LabsActions = {
  initiateLabs,
  getLabs,
  getLabsDynamic,
  getUserLabsPositions,
  getYveCrvExtraData,
  getUserYveCrvExtraData,
};
