import { createReducer } from '@reduxjs/toolkit';
import { TokensState, UserTokenActionsMap } from '@types';
import { union } from 'lodash';
import { initialStatus } from '../../../types/Status';
import { TokensActions } from './tokens.actions';

export const initialUserTokenActionsMap: UserTokenActionsMap = {
  get: { ...initialStatus },
  getAllowances: { ...initialStatus },
};

export const tokensInitialState: TokensState = {
  tokensAddresses: [],
  tokensMap: {},
  selectedTokenAddress: undefined,
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
      userTokensActionsMap: {},
    },
  },
};

const {
  getTokens,
  getTokensDynamicData,
  getUserTokens,
  setSelectedTokenAddress,
  approve,
  getTokenAllowance,
  clearTokensData,
  clearUserTokenState,
} = TokensActions;

const tokensReducer = createReducer(tokensInitialState, (builder) => {
  builder

    /* -------------------------------------------------------------------------- */
    /*                                   Setters                                  */
    /* -------------------------------------------------------------------------- */
    .addCase(setSelectedTokenAddress, (state, { payload: { tokenAddress } }) => {
      state.selectedTokenAddress = tokenAddress;
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Clear State                                */
    /* -------------------------------------------------------------------------- */
    .addCase(clearTokensData, (state) => {
      state.tokensMap = {};
      state.tokensAddresses = [];
    })
    .addCase(clearUserTokenState, (state) => {
      state.user.userTokensAddresses = [];
      state.user.userTokensAllowancesMap = {};
      state.user.userTokensMap = {};
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Fetch Data                                 */
    /* -------------------------------------------------------------------------- */

    /* -------------------------------- getTokens ------------------------------- */
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

    /* ------------------------------ getUserTokens ----------------------------- */
    .addCase(getUserTokens.pending, (state, { meta }) => {
      const tokenAddresses = meta.arg.addresses;
      tokenAddresses?.forEach((address) => {
        checkAndInitUserTokenStatus(state, address);
        state.statusMap.user.userTokensActionsMap[address].get = { loading: true };
      });
      state.statusMap.user.getUserTokens = { loading: true };
    })
    .addCase(getUserTokens.fulfilled, (state, { meta, payload: { userTokens } }) => {
      const tokenAddresses = meta.arg.addresses;
      tokenAddresses?.forEach((address) => {
        state.statusMap.user.userTokensActionsMap[address].get = {};
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
        state.statusMap.user.userTokensActionsMap[address].get = { error: error.message };
      });
      state.statusMap.user.getUserTokens = { error: error.message };
    })

    /* -------------------------- getTokensDynamicData -------------------------- */
    // getTokensDynamicData pending and reject are not implemented because for now we dont support individual token statuses
    .addCase(getTokensDynamicData.fulfilled, (state, { payload: { tokensDynamicData } }) => {
      tokensDynamicData.forEach((tokenDynamicData) => {
        const address = tokenDynamicData.address;
        state.tokensMap[address] = { ...state.tokensMap[address], ...tokenDynamicData };
      });
    })

    /* ---------------------------- getTokenAllowance --------------------------- */
    .addCase(getTokenAllowance.pending, (state, { meta }) => {
      const { tokenAddress } = meta.arg;
      checkAndInitUserTokenStatus(state, tokenAddress);
      state.statusMap.user.userTokensActionsMap[tokenAddress].getAllowances = { loading: true };
      state.statusMap.user.getUserTokensAllowances = { loading: true };
    })
    .addCase(getTokenAllowance.fulfilled, (state, { meta, payload: { allowance } }) => {
      const { tokenAddress, spenderAddress } = meta.arg;
      state.user.userTokensAllowancesMap[tokenAddress] = {
        ...state.user.userTokensAllowancesMap[tokenAddress],
        [spenderAddress]: allowance,
      };
      state.statusMap.user.userTokensActionsMap[tokenAddress].getAllowances = {};
      state.statusMap.user.getUserTokensAllowances = {};
    })
    .addCase(getTokenAllowance.rejected, (state, { meta, error }) => {
      const { tokenAddress } = meta.arg;
      state.statusMap.user.userTokensActionsMap[tokenAddress].getAllowances = { error: error.message };
      state.statusMap.user.getUserTokensAllowances = { error: error.message };
    })

    /* -------------------------------------------------------------------------- */
    /*                                Transactions                                */
    /* -------------------------------------------------------------------------- */

    /* --------------------------------- approve -------------------------------- */
    // Note: approve pending/rejected statuses are handled on each asset (vault/ironbank/...) approve action.
    .addCase(approve.fulfilled, (state, { meta, payload: { amount } }) => {
      const { tokenAddress, spenderAddress } = meta.arg;
      state.user.userTokensAllowancesMap[tokenAddress] = {
        ...state.user.userTokensAllowancesMap[tokenAddress],
        [spenderAddress]: amount,
      };
    });
});

export default tokensReducer;

function checkAndInitUserTokenStatus(state: TokensState, tokenAddress: string) {
  const actionsMap = state.statusMap.user.userTokensActionsMap[tokenAddress];
  if (actionsMap) return;
  state.statusMap.user.userTokensActionsMap[tokenAddress] = { ...initialUserTokenActionsMap };
}
