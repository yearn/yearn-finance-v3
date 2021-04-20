import { createReducer } from '@reduxjs/toolkit';
import { TokensState } from '@types';
import { initialStatus } from '../../../types/Status';
import { TokensActions } from './tokens.actions';

const initialState: TokensState = {
  tokensAddresses: [],
  tokensMap: {},
  user: {
    userTokensMap: {},
  },
  statusMap: {
    getTokens: { ...initialStatus },
    getUserTokens: { ...initialStatus },
    userTokensActiosMap: {},
  },
};

const { getTokens, getTokensDynamicData, setUserTokenData, setUserTokensMap } = TokensActions;

const tokensReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getTokens.pending, (state) => {
      state.statusMap.getTokens = { loading: true };
    })
    .addCase(getTokens.fulfilled, (state, { payload: { tokensMap, tokensAddresses } }) => {
      state.tokensMap = tokensMap;
      state.tokensAddresses = tokensAddresses;
      state.statusMap.getTokens = {};
    })
    .addCase(getTokens.rejected, (state, { error }) => {
      state.statusMap.getTokens = { error: error.message };
    })
    .addCase(setUserTokenData, (state, { payload: { userTokenData } }) => {
      state.user.userTokensMap[userTokenData.address] = userTokenData;
    })
    .addCase(setUserTokensMap, (state, { payload: { userTokensMap } }) => {
      state.user.userTokensMap = { ...state.user.userTokensMap, ...userTokensMap };
    })
    // getTokensDynamicData pending and reject are not implemented because for now we dont support individual token statuses
    .addCase(getTokensDynamicData.fulfilled, (state, { payload: { tokensDynamicData } }) => {
      tokensDynamicData.forEach((tokenDynamicData) => {
        const address = tokenDynamicData.address;
        state.tokensMap[address] = { ...state.tokensMap[address], ...tokenDynamicData };
      });
    });
});

export default tokensReducer;
