import { BigNumber, utils } from 'ethers';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Address } from '@yfi/sdk';

import { ThunkAPI } from '@frameworks/redux';
import { EnableCollateralProps, AddCollateralProps } from '@src/core/types';

import { TokensActions } from '../tokens/tokens.actions';

const setSelectedEscrowAddress = createAction<{ escrowAddress?: string }>('lines/setSelectedEscrowAddress');
const setSelectedSpigotAddress = createAction<{ spigotAddress?: string }>('lines/setSelectedSpigotAddress');

const enableCollateral = createAsyncThunk<void, EnableCollateralProps, ThunkAPI>(
  'collateral/enableCollateral',
  async (props, { extra, getState, dispatch }) => {
    const { wallet } = getState();
    const { services } = extra;
    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    // TODO chekc that they are arbiter on line that owns Escrowbeforethey send tx

    const { collateralService } = services;
    const tx = await collateralService.enableCollateral(props);
    console.log(tx);
  }
);

const addCollateral = createAsyncThunk<
  { amount: string; escrowAddress: string; token: string; success: boolean },
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

  return {
    ...props,
    amount: props.amount.toString(),
    success: !!tx,
  };
});

export const CollateralActions = {
  setSelectedEscrowAddress,
  setSelectedSpigotAddress,
  enableCollateral,
  addCollateral,
};
