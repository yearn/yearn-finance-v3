import { createReducer } from '@reduxjs/toolkit';
import { UserState } from '@types';
import { initialStatus } from '../../../types/Status';
import { getUserVaultsData } from './user.actions';

const initialState: UserState = {
  userVaultsMap: {},
  userTokensMap: {},
  statusMap: {
    getUserVaults: { ...initialStatus },
  },
};

const userReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getUserVaultsData.pending, (state) => {
      state.statusMap.getUserVaults = { loading: true };
    })
    .addCase(getUserVaultsData.fulfilled, (state, { payload: { userVaultsMap, userTokensMap } }) => {
      state.userVaultsMap = userVaultsMap;
      state.userTokensMap = userTokensMap; // this should be removed when sdk.getTokens() ready.
      state.statusMap.getUserVaults = {};
    })
    .addCase(getUserVaultsData.rejected, (state, { error }) => {
      state.statusMap.getUserVaults = { error: error.message };
    });
});

export default userReducer;
