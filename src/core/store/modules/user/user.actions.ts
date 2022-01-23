import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { NftBalances } from '@types';

/* -------------------------------------------------------------------------- */
/*                                 Clear State                                */
/* -------------------------------------------------------------------------- */

const clearNftBalance = createAction<void>('user/clearNftBalance');

/* -------------------------------------------------------------------------- */
/*                                 Fetch Data                                 */
/* -------------------------------------------------------------------------- */

const getNftBalance = createAsyncThunk<NftBalances, void, ThunkAPI>(
  'user/getNftBalance',
  async (_arg, { getState, extra }) => {
    const { wallet } = getState();
    const { userService } = extra.services;
    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    return await userService.getNftBalance(accountAddress);
  }
);

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export const UserActions = {
  getNftBalance,
  clearNftBalance,
};
