import { BigNumber, utils } from 'ethers';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Address } from '@yfi/sdk';

import { ThunkAPI } from '@frameworks/redux';
import { EnableCollateralAssetProps, AddCollateralProps, AddSpigotProps } from '@src/core/types';

import { TokensActions } from '../tokens/tokens.actions';

const setSelectedEscrow = createAction<{ escrowAddress?: string }>('lines/setSelectedEscrow');
const setSelectedSpigot = createAction<{ spigotAddress?: string }>('lines/setSelectedSpigot');
const setSelectedRevenueContract = createAction<{ contractAddress?: string }>('lines/setSelectedRevenueContract');
const setSelectedCollateralAsset = createAction<{ assetAddress?: string }>('lines/setSelectedCollateralAsset');

const enableCollateral = createAsyncThunk<
  { contract: string; token: string; success: boolean },
  EnableCollateralAssetProps,
  ThunkAPI
>('collateral/enableCollateral', async (props, { extra, getState, dispatch }) => {
  const { wallet } = getState();
  const { services } = extra;
  const userAddress = wallet.selectedAddress;
  if (!userAddress) throw new Error('WALLET NOT CONNECTED');

  // TODO chekc that they are arbiter on line that owns Escrowbeforethey send tx

  const { collateralService } = services;
  const tx = await collateralService.enableCollateral(props);
  console.log('enable collatteral action', tx);

  if (!tx) {
    throw new Error('failed to enable collateral');
  }

  return {
    ...props,
    contract: props.escrowAddress,
    success: !!tx,
  };
});

const addCollateral = createAsyncThunk<
  { contract: string; token: string; success: boolean },
  AddCollateralProps,
  ThunkAPI
>('collateral/addCollateral', async (props, { extra, getState, dispatch }) => {
  const { wallet } = getState();
  const { services } = extra;
  const userAddress = wallet.selectedAddress;
  if (!userAddress) throw new Error('WALLET NOT CONNECTED');

  // TODO chekc that they are arbiter on line that owns Escrowbeforethey send tx

  const { collateralService } = services;
  const tx = await collateralService.addCollateral(props);
  console.log('addCollateral tx', tx);

  if (!tx) {
    throw new Error('failed to add collateral');
  }

  return {
    ...props,
    contract: props.escrowAddress,
    success: !!tx,
  };
});

const addSpigot = createAsyncThunk<{ contract: string; asset: string; success: boolean }, AddSpigotProps, ThunkAPI>(
  'collateral/addSpigot',
  async (props, { extra, getState, dispatch }) => {
    const { wallet } = getState();
    const { services } = extra;
    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    // TODO chekc that they are arbiter on line that owns Escrowbeforethey send tx

    const { collateralService } = services;
    const tx = await collateralService.addSpigot(props);
    console.log('addSpigot tx', tx);

    if (!tx) {
      throw new Error('failed to enable spigot');
    }

    return {
      contract: props.lineAddress,
      asset: props.spigotAddress,
      success: !!tx,
    };
  }
);

export const CollateralActions = {
  setSelectedEscrow,
  setSelectedSpigot,
  setSelectedRevenueContract,
  setSelectedCollateralAsset,
  enableCollateral,
  addCollateral,
  addSpigot,
};
