import { createReducer } from '@reduxjs/toolkit';
import { difference, groupBy, keyBy, union } from 'lodash';

import {
  initialStatus,
  Position,
  CreditLineState,
  UserLineMetadataStatusMap,
  LineActionsStatusMap,
  PositionSummary,
  CreditLine,
} from '@types';

import { LinesActions } from './lines.actions';

export const initialLineActionsStatusMap: LineActionsStatusMap = {
  get: initialStatus,
  approve: initialStatus,
  deposit: initialStatus,
  withdraw: initialStatus,
};

export const initialUserMetadataStatusMap: UserLineMetadataStatusMap = {
  getUserLinePositions: initialStatus,
  linesActionsStatusMap: {},
};

export const linesInitialState: CreditLineState = {
  selectedLineAddress: undefined,
  linesMap: {},
  categories: {},
  user: {
    linePositions: {},
    lineAllowances: {},
  },
  statusMap: {
    getLines: initialStatus,
    getLine: initialStatus,
    getLinePage: initialStatus,
    getAllowances: initialStatus,
    deploySecuredLine: initialStatus,
    user: initialUserMetadataStatusMap,
  },
};

const {
  addCredit,
  approveDeposit,
  depositAndRepay,
  // approveZapOut,
  // signZapOut,
  withdrawLine,
  // migrateLine,
  getLine,
  getLinePage,
  getLines,
  deploySecuredLine,
  // initiateSaveLines,
  setSelectedLineAddress,
  getUserLinePositions,
  clearLinesData,
  clearUserData,
  getExpectedTransactionOutcome,
  clearTransactionData,
  // getUserLinesMetadata,
  clearSelectedLineAndStatus,
  clearLineStatus,
} = LinesActions;

const linesReducer = createReducer(linesInitialState, (builder) => {
  builder

    /* -------------------------------------------------------------------------- */
    /*                                   Setters                                  */
    /* -------------------------------------------------------------------------- */
    .addCase(setSelectedLineAddress, (state, { payload: { lineAddress } }) => {
      state.selectedLineAddress = lineAddress;
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Clear State                                */
    /* -------------------------------------------------------------------------- */
    .addCase(clearLinesData, (state) => {
      state.linesMap = {};
    })
    .addCase(clearUserData, (state) => {
      state.user.linePositions = {};
      state.user.lineAllowances = {};
    })

    // .addCase(clearTransactionData, (state) => {
    //   state.statusMap.getExpectedTransactionOutcome = {};
    // })

    .addCase(clearSelectedLineAndStatus, (state) => {
      if (!state.selectedLineAddress) return;
      const currentAddress = state.selectedLineAddress;
      // state.statusMap.linesActionsStatusMap[currentAddress] = initialLineActionsStatusMap;
      state.selectedLineAddress = undefined;
    })

    .addCase(clearLineStatus, (state, { payload: { lineAddress } }) => {
      // state.statusMap.linesActionsStatusMap[lineAddress] = initialLineActionsStatusMap;
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Fetch data                                 */
    /* -------------------------------------------------------------------------- */

    /* --------------------------- initiateSaveLines --------------------------- */
    // .addCase(initiateSaveLines.pending, (state) => {
    //   state.statusMap.initiateSaveLines = { loading: true };
    // })
    // .addCase(initiateSaveLines.fulfilled, (state) => {
    //   state.statusMap.initiateSaveLines = {};
    // })
    // .addCase(initiateSaveLines.rejected, (state, { error }) => {
    //   state.statusMap.initiateSaveLines = { error: error.message };
    // })
    /* -------------------------------- getLine ------------------------------- */
    .addCase(getLine.pending, (state) => {
      state.statusMap.getLine = { loading: true };
    })
    .addCase(getLine.fulfilled, (state, { payload: { lineData } }) => {
      if (lineData) {
        state.linesMap = { ...state.linesMap, [lineData.id]: lineData };
      }
      state.statusMap.getLine = {};
    })
    .addCase(getLine.rejected, (state, { error }) => {
      state.statusMap.getLine = { error: error.message };
    })
    /* -------------------------------- getLines ------------------------------- */
    .addCase(getLines.pending, (state) => {
      // either need to make linesData in .fullfilled be a map like request
      state.statusMap.getLines = { loading: true };
    })
    .addCase(getLines.fulfilled, (state, { payload: { linesData } }) => {
      // reset status
      state.statusMap.getLines = {};

      const categories: { [key: string]: string[] } = {};
      const lines: { [key: string]: CreditLine } = {};

      // loop over nested structure of new Lines and update state
      Object.entries(linesData).map(([category, ls]) =>
        ls?.map((l) => {
          lines[l.id] = l;
          state.statusMap.user.linesActionsStatusMap[l.id] = initialLineActionsStatusMap;
          // save line id to category for reference
          categories[category] = [...(categories[category] || []), l.id];
        })
      );

      // merge new lines with old
      state.linesMap = { ...state.linesMap, ...lines };
      // merge new categories with old
      state.categories = { ...state.categories, ...categories };
    })
    .addCase(getLines.rejected, (state, { error }) => {
      state.statusMap.getLines = { error: error.message };
    })
    /* -------------------------------- getLinePage ------------------------------- */
    .addCase(getLinePage.pending, (state) => {
      state.statusMap.getLinePage = { loading: true };
    })
    .addCase(getLinePage.fulfilled, (state, { payload: { linePageData } }) => {
      if (linePageData) {
        state.linesMap = { ...state.linesMap, [linePageData.id]: linePageData as CreditLine };
      }

      state.statusMap.getLinePage = {};
    })
    .addCase(getLinePage.rejected, (state, { error }) => {
      state.statusMap.getLinePage = { error: error.message };
    })
    /* -------------------------------- deploySecuredLine ------------------------------- */
    .addCase(deploySecuredLine.pending, (state) => {
      state.statusMap.deploySecuredLine = { loading: true };
    })
    .addCase(deploySecuredLine.fulfilled, (state) => {
      // deployLine action emits a getLine action if tx is successful

      state.statusMap.deploySecuredLine = {};
    })
    .addCase(deploySecuredLine.rejected, (state, { error }) => {
      state.statusMap.deploySecuredLine = { error: error.message };
    })
    /* ------------------------- getUserLinePositions ------------------------- */
    .addCase(getUserLinePositions.pending, (state, { meta }) => {
      const lineAddresses = meta.arg.lineAddresses || [];
      lineAddresses.forEach((address) => {
        checkAndInitUserLineStatus(state, address);
        state.statusMap.user.getUserLinePositions = { loading: true };
      });
      state.statusMap.user.getUserLinePositions = { loading: true };
    })
    .addCase(getUserLinePositions.fulfilled, (state, { meta, payload: { userLinesPositions } }) => {
      const linesPositionsMap = userLinesPositions.reduce((obj, a) => ({ ...obj, [a.id]: a }), {});
      state.user.linePositions = { ...state.user.linePositions, ...linesPositionsMap };
      state.statusMap.user.getUserLinePositions = {};
    })
    .addCase(getUserLinePositions.rejected, (state, { meta, error }) => {
      const lineAddresses = meta.arg.lineAddresses || [];
      lineAddresses.forEach((address) => {
        state.statusMap.user.getUserLinePositions = {};
      });
      state.statusMap.user.getUserLinePositions = { error: error.message };
    })

    // /* -------------------------- getUserLinePositions -------------------------- */
    // .addCase(getUserLinePositions.pending, (state) => {
    //   state.statusMap.user.getUserLinePositions = { loading: true };
    // })
    // .addCase(getUserLinePositions.fulfilled, (state, { payload: { userLinesPositions } }) => {
    //   // TODO fix data missmatch between types PositionSummary and BasicCreditLine
    //   // state.user.linePositions = userLinesPositions.reduce((map, line) => ({ ...map, [line]: state.linesMap[line]}), {});
    //   state.statusMap.user.getUserLinePositions = {};
    // })
    // .addCase(getUserLinePositions.rejected, (state, { error }) => {
    //   state.statusMap.user.getUserLinePositions = { error: error.message };
    // })

    /* ---------------------- getExpectedTransactionOutcome --------------------- */
    // .addCase(getExpectedTransactionOutcome.pending, (state) => {
    //   state.transaction = initialTransaction;
    //   state.statusMap.getExpectedTransactionOutcome = { loading: true };
    // })
    // .addCase(getExpectedTransactionOutcome.fulfilled, (state, { payload: { txOutcome } }) => {
    //   state.transaction.expectedOutcome = txOutcome;
    //   state.statusMap.getExpectedTransactionOutcome = {};
    // })
    // .addCase(getExpectedTransactionOutcome.rejected, (state, { error }) => {
    //   state.statusMap.getExpectedTransactionOutcome = { error: error.message };
    // })

    /* -------------------------------------------------------------------------- */
    /*                                Transactions                                */
    /* -------------------------------------------------------------------------- */

    /* ----------------------------- approveDeposit ----------------------------- */
    .addCase(approveDeposit.pending, (state) => {
      state.statusMap.getAllowances = { loading: true };
    })
    .addCase(approveDeposit.fulfilled, (state) => {
      // deployLine action emits a getLine action if tx is successful

      state.statusMap.getAllowances = {};
    })
    .addCase(approveDeposit.rejected, (state, { error }) => {
      state.statusMap.getAllowances = { error: error.message };
    })

    .addCase(addCredit.pending, (state) => {
      state.statusMap.getAllowances = { loading: true };
    })
    .addCase(addCredit.fulfilled, (state) => {
      // deployLine action emits a getLine action if tx is successful
      state.statusMap.getAllowances = {};
    })
    .addCase(addCredit.rejected, (state, { error }) => {
      state.statusMap.getAllowances = { error: error.message };
    })

    /* ------------------------------ depositAndRepay ------------------------------ */
    .addCase(depositAndRepay.pending, (state, { meta }) => {
      const lineAddress = meta.arg.lineAddress;
      state.statusMap.user.linesActionsStatusMap[lineAddress].deposit = { loading: true };
    })
    .addCase(depositAndRepay.fulfilled, (state, { meta }) => {
      const lineAddress = meta.arg.lineAddress;
      state.statusMap.user.linesActionsStatusMap[lineAddress].deposit = {};
    })
    .addCase(depositAndRepay.rejected, (state, { error, meta }) => {
      const lineAddress = meta.arg.lineAddress;
      state.statusMap.user.linesActionsStatusMap[lineAddress].deposit = { error: error.message };
    })

    /* ------------------------------ withdrawLine ----------------------------- */
    .addCase(withdrawLine.pending, (state, { meta }) => {
      const lineAddress = meta.arg.lineAddress;
      state.statusMap.user.linesActionsStatusMap[lineAddress].withdraw = { loading: true };
    })
    .addCase(withdrawLine.fulfilled, (state, { meta }) => {
      const lineAddress = meta.arg.lineAddress;
      state.statusMap.user.linesActionsStatusMap[lineAddress].withdraw = {};
    })
    .addCase(withdrawLine.rejected, (state, { error, meta }) => {
      const lineAddress = meta.arg.lineAddress;
      state.statusMap.user.linesActionsStatusMap[lineAddress].withdraw = { error: error.message };
    });
});

// old yearn code
// function parsePositionsIntoMap(positions: Position[]): { [lineAddress: string]: LinePositionsMap } {
//   const grouped = groupBy(positions, 'assetAddress');
//   const linesMap: { [lineAddress: string]: any } = {};
//   Object.entries(grouped).forEach(([key, value]) => {
//     linesMap[key] = keyBy(value, 'typeId');
//   });
//   return linesMap;
// }

function checkAndInitUserLineStatus(state: CreditLineState, lineAddress: string) {
  const actionsMap = state.statusMap.user.linesActionsStatusMap[lineAddress];
  if (actionsMap) return;
  state.statusMap.user.linesActionsStatusMap[lineAddress] = { ...initialLineActionsStatusMap };
}

export default linesReducer;
