import { createReducer } from '@reduxjs/toolkit';
import { IronBankState } from '@types';
import { initialStatus } from '../../../types/Status';
import { IronBankActions } from './ironBank.actions';

const initialState: IronBankState = {
  cyTokenAddresses: [],
  cyTokensMap: {},
  address: '',
  user: {
    borrowLimit: '0',
    borrowLimitUsed: '0',
    userCyTokensMap: {},
  },
  statusMap: {
    initiateIronBank: { ...initialStatus },
    getCYTokens: { ...initialStatus },
    getIronBankData: { ...initialStatus },
    cyTokensActionsMap: {},
    userCyTokensActionsMap: {},
  },
};

const { initiateIronBank, getCyTokens, getIronBankData } = IronBankActions;

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
    });
});

export default ironBankReducer;
