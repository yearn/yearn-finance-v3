import { createReducer } from '@reduxjs/toolkit';
import { keyBy, union } from 'lodash';

import { initialStatus, GaugePositionsMap, GaugesState } from '@types';

import { GaugesActions } from './gauges.actions';

export const gaugesInitialState: GaugesState = {
  gaugesAddresses: [],
  gaugesMap: {},
  selectedGaugeAddress: undefined,
  user: {
    userGaugesPositionsMap: {},
  },
  statusMap: {
    initiateGauges: initialStatus,
    getGauges: initialStatus,
    user: {
      getUserGaugesPositions: initialStatus,
    },
  },
};

const {
  setSelectedGaugeAddress,
  clearGaugesData,
  clearUserData,
  clearSelectedGauge,
  initiateGauges,
  getGauges,
  getGaugesDynamic,
  getUserGaugesPositions,
} = GaugesActions;

const gaugesReducer = createReducer(gaugesInitialState, (builder) => {
  builder

    /* -------------------------------------------------------------------------- */
    /*                                   Setters                                  */
    /* -------------------------------------------------------------------------- */
    .addCase(setSelectedGaugeAddress, (state, { payload: { gaugeAddress } }) => {
      state.selectedGaugeAddress = gaugeAddress;
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Clear State                                */
    /* -------------------------------------------------------------------------- */
    .addCase(clearGaugesData, (state) => {
      state.gaugesMap = {};
      state.gaugesAddresses = [];
    })

    .addCase(clearUserData, (state) => {
      state.user.userGaugesPositionsMap = {};
    })

    .addCase(clearSelectedGauge, (state) => {
      state.selectedGaugeAddress = undefined;
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Fetch data                                 */
    /* -------------------------------------------------------------------------- */

    /* -------------------------- initiateGauges ------------------------- */
    .addCase(initiateGauges.pending, (state) => {
      state.statusMap.initiateGauges = { loading: true };
    })
    .addCase(initiateGauges.fulfilled, (state) => {
      state.statusMap.initiateGauges = {};
    })
    .addCase(initiateGauges.rejected, (state, { error }) => {
      state.statusMap.initiateGauges = { error: error.message };
    })

    /* ---------------------------- getGauges ---------------------------- */
    .addCase(getGauges.pending, (state) => {
      state.statusMap.getGauges = { loading: true };
    })
    .addCase(getGauges.fulfilled, (state, { payload: { gauges } }) => {
      const gaugesAddresses = gauges.map(({ address }) => address);
      const gaugesMap = keyBy(gauges, 'address');
      state.gaugesAddresses = union(state.gaugesAddresses, gaugesAddresses);
      state.gaugesMap = { ...state.gaugesMap, ...gaugesMap };
      state.statusMap.getGauges = {};
    })
    .addCase(getGauges.rejected, (state, { error }) => {
      state.statusMap.getGauges = { error: error.message };
    })

    /* ------------------------- getGaugesDynamic ------------------------ */
    .addCase(getGaugesDynamic.fulfilled, (state, { payload: { gaugesDynamic } }) => {
      gaugesDynamic.forEach((datum) => {
        const { address } = datum;
        state.gaugesMap[address] = { ...state.gaugesMap[address], ...datum };
      });
    })

    /* ---------------------- getUserGaugesPositions --------------------- */
    .addCase(getUserGaugesPositions.pending, (state) => {
      state.statusMap.user.getUserGaugesPositions = { loading: true };
    })
    .addCase(getUserGaugesPositions.fulfilled, (state, { meta, payload: { positions } }) => {
      const requestedAddresses = meta.arg.addresses || [];
      if (!requestedAddresses.length) state.user.userGaugesPositionsMap = {};
      const positionsMap = positions.reduce((map, position) => {
        map[position.assetAddress][position.typeId as keyof GaugePositionsMap] = position;
        return map;
      }, {} as Record<string, GaugePositionsMap>);
      requestedAddresses.forEach((address) => {
        state.user.userGaugesPositionsMap[address] = positionsMap[address];
      });
    })
    .addCase(getUserGaugesPositions.rejected, (state, { error }) => {
      state.statusMap.user.getUserGaugesPositions = { error: error.message };
    });
});

export default gaugesReducer;
