import { createReducer } from '@reduxjs/toolkit';
import { TokensState } from '@types';
import { initialStatus } from '../../../types/Status';
import { TokensActions } from './tokens.actions';

const initialState: TokensState = {
  tokensAddresses: [],
  tokensMap: {},
  statusMap: {
    getTokens: { ...initialStatus },
  },
};

const { getTokens } = TokensActions;

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
    });
});

export default tokensReducer;
