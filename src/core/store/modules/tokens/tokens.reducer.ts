import { createReducer } from '@reduxjs/toolkit';
import { TokensState, UserTokenActionsMap } from '@types';
import { initialStatus } from '../../../types/Status';
import { TokensActions } from './tokens.actions';

export const initialUserTokenActionsMap: UserTokenActionsMap = {
  get: initialStatus,
};

const initialState: TokensState = {
  tokensAddresses: [],
  tokensMap: {},
  user: {
    userTokensMap: {},
  },
  statusMap: {
    getTokens: { ...initialStatus },
    user: {
      getUserTokens: { ...initialStatus },
      userTokensActiosMap: {},
    },
  },
};

const { getTokens, getTokensDynamicData, setUserTokenData, setUserTokensMap, approve } = TokensActions;

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
    // Note: approve pending/rejected statuses are handled on each asset (vault/ironbank/...) approve action.
    .addCase(approve.fulfilled, (state, { meta, payload: { amount } }) => {
      const { tokenAddress, spenderAddress } = meta.arg;
      const userTokenData = state.user.userTokensMap[tokenAddress];
      state.user.userTokensMap[tokenAddress] = {
        ...userTokenData,
        allowancesMap: {
          ...userTokenData.allowancesMap,
          [spenderAddress]: amount,
        },
      };
    })
    .addCase(setUserTokenData, (state, { payload: { userTokenData } }) => {
      state.user.userTokensMap[userTokenData.address] = userTokenData;
    })
    .addCase(setUserTokensMap, (state, { payload: { userTokensMap } }) => {
      const tokensAddresses = Object.keys(userTokensMap);
      const userTokensActiosMap: any = {};
      tokensAddresses.forEach((address) => (userTokensActiosMap[address] = initialUserTokenActionsMap));
      state.user.userTokensMap = { ...state.user.userTokensMap, ...userTokensMap };
      state.statusMap.user.userTokensActiosMap = {
        ...state.statusMap.user.userTokensActiosMap,
        ...userTokensActiosMap,
      };
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
