import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { TokenDynamicData, Loan, Balance, Integer, GetLoansProps, Address } from '@types';

/* -------------------------------------------------------------------------- */
/*                                   Setters                                  */
/* -------------------------------------------------------------------------- */

const setSelectedLoanAddress = createAction<{ loanAddress?: string }>('loans/setSelectedLoanAddress');

/* -------------------------------------------------------------------------- */
/*                                 Clear State                                */
/* -------------------------------------------------------------------------- */

const clearSelectedLoan = createAction<void>('loans/clearSelectedLoans');
const clearLoansData = createAction<void>('loans/clearLoansData');

/* -------------------------------------------------------------------------- */
/*                                 Fetch Data                                 */
/* -------------------------------------------------------------------------- */

const getLoans = createAsyncThunk<{ loansData: Loan[] }, { params: GetLoansProps }, ThunkAPI>(
  'tokens/getLoans',
  async ({ params }, { getState, extra }) => {
    const { network } = getState();
    const { loanService } = extra.services;
    const loansData: Loan[] = await loanService.getLoans(params);
    return { loansData };
  }
);

// const getTokensDynamicData = createAsyncThunk<
//   { tokensDynamicData: TokenDynamicData[] },
//   { addresses: string[] },
//   ThunkAPI
// >('tokens/getTokensDynamic', async ({ addresses }, { getState, extra }) => {
//   const { network } = getState();
//   const { tokenService } = extra.services;
//   const tokensDynamicData = await tokenService.getTokensDynamicData({ network: network.current, addresses });
//   return { tokensDynamicData };
// });

/* -------------------------------------------------------------------------- */
/*                             Transaction Methods                            */
/* -------------------------------------------------------------------------- */

// const approve = createAsyncThunk<
//   { amount: string },
//   { tokenAddress: string; spenderAddress: string; amountToApprove?: string },
//   ThunkAPI
// >('tokens/approve', async ({ tokenAddress, spenderAddress, amountToApprove }, { extra, getState }) => {
//   const { network, wallet, app } = getState();
//   const { tokenService, transactionService } = extra.services;
//   const amount = amountToApprove ?? extra.config.MAX_UINT256;

//   const accountAddress = wallet.selectedAddress;
//   if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

//   const tx = await tokenService.approve({
//     network: network.current,
//     accountAddress,
//     tokenAddress,
//     spenderAddress,
//     amount,
//   });
//   const notifyEnabled = app.servicesEnabled.notify;
//   await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

//   return { amount };
// });

/* -------------------------------------------------------------------------- */
/*                                Subscriptions                               */
/* -------------------------------------------------------------------------- */

// const initSubscriptions = createAsyncThunk<void, void, ThunkAPI>(
//   'tokens/initSubscriptions',
//   async (_arg, { extra, dispatch }) => {
//     const { subscriptionService } = extra.services;
//     subscriptionService.subscribe({
//       module: 'tokens',
//       event: 'priceUsdc',
//       action: (tokenAddresses: string[]) => {
//         dispatch(getTokensDynamicData({ addresses: tokenAddresses }));
//       },
//     });
//     subscriptionService.subscribe({
//       module: 'tokens',
//       event: 'balances',
//       action: (tokenAddresses: string[]) => {
//         dispatch(getUserTokens({ addresses: tokenAddresses }));
//       },
//     });
//     subscriptionService.subscribe({
//       module: 'tokens',
//       event: 'getAllowance',
//       action: (tokenAddress: string, spenderAddress: string) => {
//         dispatch(getTokenAllowance({ tokenAddress, spenderAddress }));
//       },
//     });
//   }
// );

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export const LoansActions = {
  setSelectedLoanAddress,
  getLoans,
  clearSelectedLoan,
  clearLoansData,
  // initSubscriptions,
};
