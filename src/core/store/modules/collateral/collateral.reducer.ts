import { createReducer } from '@reduxjs/toolkit';
import _, { difference, groupBy, keyBy, union } from 'lodash';

import {
  initialStatus,
  Position,
  CollateralState,
  CollateralActionsStatusMap,
  PositionSummary,
  AggregatedCreditLine,
} from '@types';

import { CollateralActions } from './collateral.actions';

export const initialCollateralActionsStatusMap: CollateralActionsStatusMap = {
  approve: {},
  addCollateral: {},
  enableCollateral: {},
  addSpigot: {},
  releaseSpigot: {},
  updateOwnerSplit: {},
  getLineCollateralData: {},
};

export const collateralInitialState: CollateralState = {
  selectedEscrow: undefined,
  selectedSpigot: undefined,
  user: {
    escrowAllowances: {},
  },
  statusMap: initialCollateralActionsStatusMap,
};

const {
  setSelectedEscrow,
  setSelectedSpigot,
  setSelectedRevenueContract,
  setSelectedCollateralAsset,
  addCollateral,
  enableCollateral,
} = CollateralActions;

const collateralReducer = createReducer(collateralInitialState, (builder) => {
  builder
    /* -------------------------------------------------------------------------- */
    /*                                   Setters                                  */
    /* -------------------------------------------------------------------------- */
    .addCase(setSelectedEscrow, (state, { payload: { escrowAddress } }) => {
      state.selectedEscrow = escrowAddress;
    })
    .addCase(setSelectedSpigot, (state, { payload: { spigotAddress } }) => {
      state.selectedSpigot = spigotAddress;
    })
    .addCase(setSelectedRevenueContract, (state, { payload: { contractAddress } }) => {
      state.selectedRevenueContract = contractAddress;
    })
    .addCase(setSelectedCollateralAsset, (state, { payload: { assetAddress } }) => {
      state.selectedCollateralAsset = assetAddress;
    })

    /* -------------------------------- enableCollateral ------------------------------- */
    .addCase(enableCollateral.pending, (state, payload) => {
      console.log('collateral action payload', payload);
      // state.statusMap.enableCollateral = { loading: true };
    })
    .addCase(enableCollateral.fulfilled, (state, payload) => {
      console.log('collateral action payload', payload);
      // state.statusMap.enableCollateral = {};
    })
    .addCase(enableCollateral.rejected, (state, { error }) => {
      // state.statusMap.enableCollateral = { error: error.message };
    })
    /* -------------------------------- addCollateral ------------------------------- */
    .addCase(addCollateral.pending, (state, payload) => {
      console.log('collateral action payload', payload);
      // state.statusMap.addCollateral = { loading: true };
    })
    .addCase(addCollateral.fulfilled, (state, payload) => {
      console.log('collateral action payload', payload);
      // state.statusMap.addCollateral = {};
    })
    .addCase(addCollateral.rejected, (state, { error }) => {
      // _.assignIn(state.statusMap.addCollateral, { [contract]: { [token]: { error: error.message } } });
    });
});

export default collateralReducer;
