import { UserState } from '@types';
import { createReducer } from '@reduxjs/toolkit';
import { UserActions } from './user.actions';

import { initialStatus } from '@types';

export const userInitialState: UserState = {
  nft: {
    bluePillNftBalance: 0,
    woofyNftBalance: 0,
  },
  statusMap: {
    getNftBalance: { ...initialStatus },
  },
};

const { getNftBalance, clearNftBalance } = UserActions;

const userReducer = createReducer(userInitialState, (builder) => {
  builder

    /* -------------------------------------------------------------------------- */
    /*                                 Clear State                                */
    /* -------------------------------------------------------------------------- */
    .addCase(clearNftBalance, (state) => {
      state.nft = {
        bluePillNftBalance: 0,
        woofyNftBalance: 0,
      };
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Fetch Data                                 */
    /* -------------------------------------------------------------------------- */
    .addCase(getNftBalance.pending, (state) => {
      state.statusMap.getNftBalance = { loading: true };
    })
    .addCase(getNftBalance.rejected, (state, { error }) => {
      state.statusMap.getNftBalance = { error: error.message };
    })
    .addCase(getNftBalance.fulfilled, (state, { payload: nftBalance }) => {
      state.nft = nftBalance;
      state.statusMap.getNftBalance = {};
    });
});

export default userReducer;
