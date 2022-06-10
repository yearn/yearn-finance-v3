import { createReducer } from '@reduxjs/toolkit';

import { initialStatus, GaugesState } from '@types';

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

const gaugesReducer = createReducer(gaugesInitialState, (builder) => {});

export default gaugesReducer;
