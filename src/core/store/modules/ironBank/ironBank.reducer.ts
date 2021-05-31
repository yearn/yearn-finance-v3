import { createReducer } from '@reduxjs/toolkit';
import {
  CyTokenActionsStatusMap,
  IronBankState,
  UserCyTokenActionsStatusMap,
  IronBankMarketPositionsMap,
  Position,
} from '@types';
import { groupBy, keyBy, union } from 'lodash';
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
  ironBankData: undefined,
  user: {
    borrowLimit: '0',
    borrowLimitUsed: '0',
    userCyTokensMap: {},
    marketsAllowancesMap: {},
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
    .addCase(getIronBankData.fulfilled, (state, { payload: { ironBankData } }) => {
      state.ironBankData = ironBankData;
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
    .addCase(getUserCyTokens.pending, (state, { meta }) => {
      const marketAddresses = meta.arg.marketAddresses || [];
      marketAddresses.forEach((address) => {
        checkAndInitUserMarketStatus(state, address);
        state.statusMap.user.userCyTokensActionsMap[address].get = { loading: true };
      });
      state.statusMap.user.getUserCYTokens = { loading: true };
    })
    .addCase(getUserCyTokens.fulfilled, (state, { meta, payload: { userMarketsData } }) => {
      const marketsPositionsMap = parsePositionsIntoMap(userMarketsData);
      const marketAddresses = meta.arg.marketAddresses;
      marketAddresses?.forEach((address) => {
        state.statusMap.user.userCyTokensActionsMap[address].get = {};
      });

      userMarketsData.forEach((position) => {
        const address = position.assetAddress;
        const allowancesMap: any = {};
        position.assetAllowances.forEach((allowance) => (allowancesMap[allowance.spender] = allowance.amount));

        state.user.marketsAllowancesMap[address] = allowancesMap;
      });

      state.user.userCyTokensMap = { ...state.user.userCyTokensMap, ...marketsPositionsMap };
      state.statusMap.user.getUserCYTokens = {};
    })
    .addCase(getUserCyTokens.rejected, (state, { meta, error }) => {
      const marketAddresses = meta.arg.marketAddresses || [];
      marketAddresses.forEach((address) => {
        state.statusMap.user.userCyTokensActionsMap[address].get = {};
      });
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

function checkAndInitUserMarketStatus(state: IronBankState, marketAddress: string) {
  const actionsMap = state.statusMap.user.userCyTokensActionsMap[marketAddress];
  if (actionsMap) return;
  state.statusMap.user.userCyTokensActionsMap[marketAddress] = { ...initialUserCyTokensActionsMap };
}

function parsePositionsIntoMap(positions: Position[]): { [marketAddress: string]: IronBankMarketPositionsMap } {
  const grouped = groupBy(positions, 'assetAddress');
  const marketsMap: { [marketAddress: string]: any } = {};
  Object.entries(grouped).forEach(([key, value]) => {
    marketsMap[key] = keyBy(value, 'typeId');
  });
  return marketsMap;
}
