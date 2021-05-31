import { createReducer } from '@reduxjs/toolkit';
import { CyTokenActionsStatusMap, IronBankState, UserCyTokenActionsStatusMap } from '@types';
import { union } from 'lodash';
import { initialStatus } from '../../../types/Status';
import { IronBankActions } from './ironBank.actions';

export const initialCyTokensActionsMap: CyTokenActionsStatusMap = {
  approve: initialStatus,
  get: initialStatus,
  borrow: initialStatus,
  replay: initialStatus,
  supply: initialStatus,
  withdraw: initialStatus,
};

export const initialUserCyTokensActionsMap: UserCyTokenActionsStatusMap = {
  get: initialStatus,
};

const initialState: IronBankState = {
  cyTokenAddresses: [],
  cyTokensMap: {},
  address: '',
  selectedCyTokenAddress: '',
  user: {
    borrowLimit: '0',
    borrowLimitUsed: '0',
    userCyTokensMap: {},
  },
  statusMap: {
    initiateIronBank: { ...initialStatus },
    getIronBankData: { ...initialStatus },
    getCYTokens: { ...initialStatus },
    cyTokensActionsMap: {},
    user: {
      getUserCYTokens: { ...initialStatus },
      userCyTokensActionsMap: {},
    },
  },
};

const {
  initiateIronBank,
  getCyTokens,
  getIronBankData,
  getUserCyTokens,
  setSelectedCyTokenAddress,
  approveCyToken,
} = IronBankActions;

const ironBankReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(initiateIronBank.pending, (state) => {
      state.statusMap.initiateIronBank = { loading: true };
    })
    .addCase(initiateIronBank.fulfilled, (state) => {
      state.statusMap.initiateIronBank = {};
    })
    .addCase(initiateIronBank.rejected, (state, { error }) => {
      state.statusMap.initiateIronBank = { error: error.message };
    })
    .addCase(getIronBankData.pending, (state) => {
      state.statusMap.getIronBankData = { loading: true };
    })
    .addCase(getIronBankData.fulfilled, (state, { payload: { address, borrowLimit, borrowLimitUsed } }) => {
      state.address = address;
      state.user.borrowLimit = borrowLimit;
      state.user.borrowLimitUsed = borrowLimitUsed;
      state.statusMap.getIronBankData = {};
    })
    .addCase(getIronBankData.rejected, (state, { error }) => {
      state.statusMap.getIronBankData = { error: error.message };
    })
    .addCase(getCyTokens.pending, (state) => {
      state.statusMap.getCYTokens = { loading: true };
    })
    .addCase(getCyTokens.fulfilled, (state, { payload: { ironBankMarkets } }) => {
      const marketAddresses: string[] = [];
      ironBankMarkets.forEach((market) => {
        const address = market.address;
        marketAddresses.push(address);
        state.cyTokensMap[address] = market;
        state.statusMap.cyTokensActionsMap[address] = initialCyTokensActionsMap;
        state.statusMap.user.userCyTokensActionsMap[address] = initialUserCyTokensActionsMap;
      });
      state.cyTokenAddresses = union(state.cyTokenAddresses, marketAddresses);
      state.statusMap.getCYTokens = {};
    })
    .addCase(getCyTokens.rejected, (state, { error }) => {
      state.statusMap.getCYTokens = { error: error.message };
    })
    .addCase(getUserCyTokens.pending, (state) => {
      state.statusMap.user.getUserCYTokens = { loading: true };
    })
    .addCase(getUserCyTokens.fulfilled, (state, { payload: { userCyTokensMap } }) => {
      state.user.userCyTokensMap = userCyTokensMap;
      state.statusMap.user.getUserCYTokens = {};
    })
    .addCase(getUserCyTokens.rejected, (state, { error }) => {
      state.statusMap.user.getUserCYTokens = { error: error.message };
    })
    .addCase(approveCyToken.pending, (state, { meta }) => {
      const { cyTokenAddress } = meta.arg;
      state.statusMap.cyTokensActionsMap[cyTokenAddress].approve = { loading: true };
    })
    .addCase(approveCyToken.fulfilled, (state, { meta }) => {
      const { cyTokenAddress } = meta.arg;
      state.statusMap.cyTokensActionsMap[cyTokenAddress].approve = {};
    })
    .addCase(approveCyToken.rejected, (state, { meta, error }) => {
      const { cyTokenAddress } = meta.arg;
      state.statusMap.cyTokensActionsMap[cyTokenAddress].approve = { error: error.message };
    })
    .addCase(setSelectedCyTokenAddress, (state, { payload: { cyTokenAddress } }) => {
      state.selectedCyTokenAddress = cyTokenAddress;
    });
});

export default ironBankReducer;
