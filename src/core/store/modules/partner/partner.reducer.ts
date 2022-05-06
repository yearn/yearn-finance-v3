import { createReducer } from '@reduxjs/toolkit';

import { PartnerState } from '@types';

import { PartnerActions } from './partner.actions';

export const partnerInitialState: PartnerState = {
  id: undefined,
  address: undefined,
};

const { changePartner } = PartnerActions;

const partnerReducer = createReducer(partnerInitialState, (builder) => {
  builder.addCase(changePartner, (state, { payload: { id, address } }) => {
    state.id = id;
    state.address = address;
  });
});

export default partnerReducer;
