import { createReducer } from '@reduxjs/toolkit';
import { UserState } from '@types';
import { initialStatus } from '../../../types/Status';
import { UserActions } from './user.actions';

const initialState: UserState = {
  userVaultsMap: {},
  userTokensMap: {},
  statusMap: {
    getUserVaults: { ...initialStatus },
  },
};

const userReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(UserActions.getUserVaultsData.pending, (state) => {
      state.statusMap.getUserVaults = { loading: true };
    })
    .addCase(UserActions.getUserVaultsData.fulfilled, (state, { payload: { userVaultsMap, userTokensMap } }) => {
      state.userVaultsMap = { ...state.userVaultsMap, ...userVaultsMap };
      state.userTokensMap = { ...state.userTokensMap, ...userTokensMap }; // this should be removed when sdk.getTokens() ready.
      state.statusMap.getUserVaults = {};
    })
    .addCase(UserActions.getUserVaultsData.rejected, (state, { error }) => {
      state.statusMap.getUserVaults = { error: error.message };
    })
    .addCase(UserActions.setUserTokenData, (state, { payload: { userTokenData } }) => {
      console.log({ UserActions });
      console.log({ stuff: { ...UserActions } });

      state.userTokensMap[userTokenData.address] = userTokenData;
    });
});

export default userReducer;
