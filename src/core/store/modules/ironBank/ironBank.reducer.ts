import { createReducer } from '@reduxjs/toolkit';
import { IronBankState } from '@types';
import { initialStatus } from '../../../types/Status';
import { IronBankActions } from './ironBank.actions';

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

const { initiateIronBank, getCyTokens, getIronBankData, getUserCyTokens, setSelectedCyTokenAddress } = IronBankActions;

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
    .addCase(getCyTokens.fulfilled, (state, { payload: { cyTokensAddresses, cyTokensMap } }) => {
      state.cyTokenAddresses = cyTokensAddresses;
      state.cyTokensMap = cyTokensMap;
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
    .addCase(setSelectedCyTokenAddress, (state, { payload: { cyTokenAddress } }) => {
      state.selectedCyTokenAddress = cyTokenAddress;
    });
});

export default ironBankReducer;
