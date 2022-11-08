import { createReducer } from '@reduxjs/toolkit';
import { difference, groupBy, keyBy, union } from 'lodash';

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
  approve: initialStatus,
  addCollateral: initialStatus,
  enableCollateral: initialStatus,
  addSpigot: initialStatus,
  releaseSpigot: initialStatus,
  updateOwnerSplit: initialStatus,
  getLineCollateralData: initialStatus,
};

export const collateralInitialState: CollateralState = {
  selectedEscrow: undefined,
  selectedSpigot: undefined,
  user: {
    escrowAllowances: {},
  },
  statusMap: initialCollateralActionsStatusMap,
};

const { setSelectedEscrowAddress, setSelectedSpigotAddress, addCollateral, enableCollateral } = CollateralActions;

const collateralReducer = createReducer(collateralInitialState, (builder) => {
  builder
    /* -------------------------------------------------------------------------- */
    /*                                   Setters                                  */
    /* -------------------------------------------------------------------------- */
    .addCase(setSelectedEscrowAddress, (state, { payload: { escrowAddress } }) => {
      state.selectedEscrow = escrowAddress;
    })
    .addCase(setSelectedSpigotAddress, (state, { payload: { spigotAddress } }) => {
      state.selectedSpigot = spigotAddress;
    })

    /* -------------------------------- enableCollateral ------------------------------- */
    .addCase(enableCollateral.pending, (state) => {
      state.statusMap.enableCollateral = { loading: true };
    })
    .addCase(enableCollateral.fulfilled, (state) => {
      state.statusMap.enableCollateral = {};
    })
    .addCase(enableCollateral.rejected, (state, { error }) => {
      state.statusMap.enableCollateral = { error: error.message };
    })
    /* -------------------------------- enableCollateral ------------------------------- */
    .addCase(addCollateral.pending, (state) => {
      state.statusMap.addCollateral = { loading: true };
    })
    // .addCase(addCollateral.fulfilled, (state, { escroAddressw, amout, amount, success }) => {
    //   state.statusMap.addCollateral = {};
    // })
    .addCase(addCollateral.rejected, (state, { error }) => {
      state.statusMap.addCollateral = { error: error.message };
    });
});

export default collateralReducer;
