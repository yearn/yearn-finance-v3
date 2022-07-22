import { createReducer } from '@reduxjs/toolkit';
import { union } from 'lodash';

import { LoanState, initialStatus } from '@types';

import { LoansActions } from './loans.actions';

export const loansInitialState: LoanState = {
  loansAddresses: [],
  loansMap: {},
  selectedLoanAddress: undefined,
  loan: undefined,
  statusMap: {
    getLoans: { ...initialStatus },
  },
};

const { setSelectedLoanAddress, getLoans, clearSelectedLoan, clearLoansData } = LoansActions;

const loansReducer = createReducer(loansInitialState, (builder) => {
  builder

    /* -------------------------------------------------------------------------- */
    /*                                   Setters                                  */
    /* -------------------------------------------------------------------------- */
    .addCase(setSelectedLoanAddress, (state, { payload: { loanAddress } }) => {
      state.selectedLoanAddress = loanAddress;
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Clear State                                */
    /* -------------------------------------------------------------------------- */
    .addCase(clearLoansData, (state) => {
      state.loansMap = {};
      state.loansAddresses = [];
    })
    .addCase(clearSelectedLoan, (state) => {
      state.loan = undefined;
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Fetch Data                                 */
    /* -------------------------------------------------------------------------- */

    /* -------------------------------- getTokens ------------------------------- */
    .addCase(getLoans.pending, (state) => {
      state.statusMap.getLoans = { loading: true };
    })
    .addCase(getLoans.fulfilled, (state, { payload: { loansData } }) => {
      const tokenAddresses: string[] = [];
      loansData.forEach((loan) => {
        state.loansMap[loan.id] = loan;
        tokenAddresses.push(loan.id);
      });
      state.loansAddresses = union(state.loansAddresses, tokenAddresses);
      state.statusMap.getLoans = {};
    });

  /* -------------------------------------------------------------------------- */
  /*                                Transactions                                */
  /* -------------------------------------------------------------------------- */

  /* --------------------------------- approve -------------------------------- */
  // Note: approve pending/rejected statuses are handled on each asset (vault/ironbank/...) approve action.
  // .addCase(approve.fulfilled, (state, { meta, payload: { amount } }) => {
  //   const { tokenAddress, spenderAddress } = meta.arg;
  //   state.user.userTokensAllowancesMap[tokenAddress] = {
  //     ...state.user.userTokensAllowancesMap[tokenAddress],
  //     [spenderAddress]: amount,
  //   };
  // });
});

export default loansReducer;
