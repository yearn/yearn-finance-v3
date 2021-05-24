import { createReducer } from '@reduxjs/toolkit';
import { TokensState, UserTokenActionsMap } from '@types';
import { union } from 'lodash';
import { initialStatus } from '../../../types/Status';
import { TokensActions } from './tokens.actions';

export const initialUserTokenActionsMap: UserTokenActionsMap = {
  get: { ...initialStatus },
  getAllowances: { ...initialStatus },
};

const initialState: TokensState = {
  tokensAddresses: [],
  tokensMap: {},
  user: {
    userTokensAddresses: [],
    userTokensMap: {},
    userTokensAllowancesMap: {},
  },
  statusMap: {
    getTokens: { ...initialStatus },
    user: {
      getUserTokens: { ...initialStatus },
      getUserTokensAllowances: { ...initialStatus },
      userTokensActiosMap: {},
    },
  },
};

const { getTokens, getTokensDynamicData, getUserTokens, approve, getTokenAllowance } = TokensActions;

const tokensReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getTokens.pending, (state) => {
      state.statusMap.getTokens = { loading: true };
    })
    .addCase(getTokens.fulfilled, (state, { payload: { tokensData } }) => {
      const tokenAddresses: string[] = [];
      tokensData.forEach((token) => {
        state.tokensMap[token.address] = token;
        tokenAddresses.push(token.address);
      });
      state.tokensAddresses = union(state.tokensAddresses, tokenAddresses);
      state.statusMap.getTokens = {};
    })
    .addCase(getTokens.rejected, (state, { error }) => {
      state.statusMap.getTokens = { error: error.message };
    })
    .addCase(getUserTokens.pending, (state, { meta }) => {
      const tokenAddresses = meta.arg.addresses;
      tokenAddresses?.forEach((address) => {
        checkAndInitUserTokenStatus(state, address);
        state.statusMap.user.userTokensActiosMap[address].get = { loading: true };
      });
      state.statusMap.user.getUserTokens = { loading: true };
    })
    .addCase(getUserTokens.fulfilled, (state, { meta, payload: { userTokens } }) => {
      const tokenAddresses = meta.arg.addresses;
      tokenAddresses?.forEach((address) => {
        state.statusMap.user.userTokensActiosMap[address].get = {};
      });

      const fetchedTokenAddesses: string[] = [];
      userTokens.forEach((userToken) => {
        fetchedTokenAddesses.push(userToken.address);
        state.user.userTokensMap[userToken.address] = userToken;
      });

      state.user.userTokensAddresses = union(state.user.userTokensAddresses, fetchedTokenAddesses);
      state.statusMap.user.getUserTokens = {};
    })
    .addCase(getUserTokens.rejected, (state, { meta, error }) => {
      const tokenAddresses = meta.arg.addresses;
      tokenAddresses?.forEach((address) => {
        state.statusMap.user.userTokensActiosMap[address].get = { error: error.message };
      });
      state.statusMap.user.getUserTokens = { error: error.message };
    })
    // Note: approve pending/rejected statuses are handled on each asset (vault/ironbank/...) approve action.
    .addCase(approve.fulfilled, (state, { meta, payload: { amount } }) => {
      const { tokenAddress, spenderAddress } = meta.arg;
      state.user.userTokensAllowancesMap[tokenAddress] = {
        ...state.user.userTokensAllowancesMap[tokenAddress],
        [spenderAddress]: amount,
      };
    })
    // getTokensDynamicData pending and reject are not implemented because for now we dont support individual token statuses
    .addCase(getTokensDynamicData.fulfilled, (state, { payload: { tokensDynamicData } }) => {
      tokensDynamicData.forEach((tokenDynamicData) => {
        const address = tokenDynamicData.address;
        state.tokensMap[address] = { ...state.tokensMap[address], ...tokenDynamicData };
      });
    })
    .addCase(getTokenAllowance.pending, (state, { meta }) => {
      const { tokenAddress } = meta.arg;
      checkAndInitUserTokenStatus(state, tokenAddress);
      state.statusMap.user.userTokensActiosMap[tokenAddress].getAllowances = { loading: true };
      state.statusMap.user.getUserTokensAllowances = { loading: true };
    })
    .addCase(getTokenAllowance.fulfilled, (state, { meta, payload: { allowance } }) => {
      const { tokenAddress, spenderAddress } = meta.arg;
      state.user.userTokensAllowancesMap[tokenAddress] = {
        ...state.user.userTokensAllowancesMap[tokenAddress],
        [spenderAddress]: allowance,
      };
      state.statusMap.user.userTokensActiosMap[tokenAddress].getAllowances = {};
      state.statusMap.user.getUserTokensAllowances = {};
    })
    .addCase(getTokenAllowance.rejected, (state, { meta, error }) => {
      const { tokenAddress } = meta.arg;
      state.statusMap.user.userTokensActiosMap[tokenAddress].getAllowances = { error: error.message };
      state.statusMap.user.getUserTokensAllowances = { error: error.message };
    });
});

export default tokensReducer;

function checkAndInitUserTokenStatus(state: TokensState, tokenAddress: string) {
  const actionsMap = state.statusMap.user.userTokensActiosMap[tokenAddress];
  if (actionsMap) return;
  state.statusMap.user.userTokensActiosMap[tokenAddress] = { ...initialUserTokenActionsMap };
}
