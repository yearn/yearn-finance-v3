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

const { getUserVaultsData, setUserTokenData } = UserActions;

const userReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getUserVaultsData.pending, (state) => {
      state.statusMap.getUserVaults = { loading: true };
    })
    .addCase(getUserVaultsData.fulfilled, (state, { payload: { userVaultsMap, userTokensMap } }) => {
      state.userVaultsMap = { ...state.userVaultsMap, ...userVaultsMap };
      state.userTokensMap = { ...state.userTokensMap, ...userTokensMap }; // this should be removed when sdk.getTokens() ready.
      state.statusMap.getUserVaults = {};
    })
    .addCase(getUserVaultsData.rejected, (state, { error }) => {
      state.statusMap.getUserVaults = { error: error.message };
    })
    .addCase(setUserTokenData, (state, { payload: { userTokenData } }) => {
      state.userTokensMap[userTokenData.address] = userTokenData;
    });
});

export default userReducer;
