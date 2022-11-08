import { BigNumber, utils } from 'ethers';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Address } from '@yfi/sdk';

import { ThunkAPI } from '@frameworks/redux';
import { EnableCollateralProps, AddCollateralProps } from '@src/core/types';

import { TokensActions } from '../tokens/tokens.actions';

const setSelectedEscrowAddress = createAction<{ escrowAddress?: string }>('lines/setSelectedEscrowAddress');
const setSelectedSpigotAddress = createAction<{ spigotAddress?: string }>('lines/setSelectedSpigotAddress');

const enableCollateral = createAsyncThunk<
  { contract: string; token: string; success: boolean },
  EnableCollateralProps,
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
  console.log(tx);

  if (!tx) {
    throw new Error('failed to add collateral');
  }

  return {
    ...props,
    contract: props.escrowAddress,
    success: !!tx,
  };
});

export const CollateralActions = {
  setSelectedEscrowAddress,
  setSelectedSpigotAddress,
  enableCollateral,
  addCollateral,
};
