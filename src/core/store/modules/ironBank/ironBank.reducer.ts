import { createReducer } from '@reduxjs/toolkit';
import {
  MarketActionsStatusMap,
  IronBankState,
  UserMarketActionsStatusMap,
  IronBankMarketPositionsMap,
  Position,
} from '@types';
import { groupBy, keyBy, union } from 'lodash';
import { initialStatus } from '../../../types/Status';
import { IronBankActions } from './ironBank.actions';

export const initialMarketsActionsMap: MarketActionsStatusMap = {
  approve: initialStatus,
  get: initialStatus,
  borrow: initialStatus,
  replay: initialStatus,
  supply: initialStatus,
  withdraw: initialStatus,
};

export const initialUserMarketsActionsMap: UserMarketActionsStatusMap = {
  get: initialStatus,
};

const initialState: IronBankState = {
  marketAddresses: [],
  marketsMap: {},
  selectedMarketAddress: '',
  ironBankData: undefined,
  user: {
    userMarketsMap: {},
    marketsAllowancesMap: {},
  },
  statusMap: {
    initiateIronBank: { ...initialStatus },
    getIronBankData: { ...initialStatus },
    getMarkets: { ...initialStatus },
    marketsActionsMap: {},
    user: {
      getUserMarkets: { ...initialStatus },
      userMarketsActionsMap: {},
    },
  },
};

const {
  initiateIronBank,
  getMarkets,
  getIronBankData,
  getUserMarkets,
  setSelectedMarketAddress,
  approveMarket,
  getMarketsDynamic,
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
    .addCase(getMarkets.pending, (state) => {
      state.statusMap.getMarkets = { loading: true };
    })
    .addCase(getMarkets.fulfilled, (state, { payload: { ironBankMarkets } }) => {
      const marketAddresses: string[] = [];
      ironBankMarkets.forEach((market) => {
        const address = market.address;
        marketAddresses.push(address);
        state.marketsMap[address] = market;
        state.statusMap.marketsActionsMap[address] = initialMarketsActionsMap;
        state.statusMap.user.userMarketsActionsMap[address] = initialUserMarketsActionsMap;
      });
      state.marketAddresses = union(state.marketAddresses, marketAddresses);
      state.statusMap.getMarkets = {};
    })
    .addCase(getMarkets.rejected, (state, { error }) => {
      state.statusMap.getMarkets = { error: error.message };
    })
    .addCase(getUserMarkets.pending, (state, { meta }) => {
      const marketAddresses = meta.arg.marketAddresses || [];
      marketAddresses.forEach((address) => {
        checkAndInitUserMarketStatus(state, address);
        state.statusMap.user.userMarketsActionsMap[address].get = { loading: true };
      });
      state.statusMap.user.getUserMarkets = { loading: true };
    })
    .addCase(getUserMarkets.fulfilled, (state, { meta, payload: { userMarketsData } }) => {
      const marketsPositionsMap = parsePositionsIntoMap(userMarketsData);
      const marketAddresses = meta.arg.marketAddresses;
      marketAddresses?.forEach((address) => {
        state.statusMap.user.userMarketsActionsMap[address].get = {};
      });

      userMarketsData.forEach((position) => {
        const address = position.assetAddress;
        const allowancesMap: any = {};
        position.assetAllowances.forEach((allowance) => (allowancesMap[allowance.spender] = allowance.amount));

        state.user.marketsAllowancesMap[address] = allowancesMap;
      });

      state.user.userMarketsMap = { ...state.user.userMarketsMap, ...marketsPositionsMap };
      state.statusMap.user.getUserMarkets = {};
    })
    .addCase(getUserMarkets.rejected, (state, { meta, error }) => {
      const marketAddresses = meta.arg.marketAddresses || [];
      marketAddresses.forEach((address) => {
        state.statusMap.user.userMarketsActionsMap[address].get = {};
      });
      state.statusMap.user.getUserMarkets = { error: error.message };
    })
    .addCase(approveMarket.pending, (state, { meta }) => {
      const { marketAddress } = meta.arg;
      state.statusMap.marketsActionsMap[marketAddress].approve = { loading: true };
    })
    .addCase(approveMarket.fulfilled, (state, { meta }) => {
      const { marketAddress } = meta.arg;
      state.statusMap.marketsActionsMap[marketAddress].approve = {};
    })
    .addCase(approveMarket.rejected, (state, { meta, error }) => {
      const { marketAddress } = meta.arg;
      state.statusMap.marketsActionsMap[marketAddress].approve = { error: error.message };
    })
    .addCase(setSelectedMarketAddress, (state, { payload: { marketAddress } }) => {
      state.selectedMarketAddress = marketAddress;
    })
    .addCase(getMarketsDynamic.pending, (state, { meta }) => {
      const marketAddresses = meta.arg.addresses;
      marketAddresses.forEach((address) => {
        state.statusMap.marketsActionsMap[address].get = { loading: true };
      });
    })
    .addCase(getMarketsDynamic.fulfilled, (state, { meta, payload: { marketsDynamicData } }) => {
      const marketAddresses = meta.arg.addresses;
      marketAddresses.forEach((address) => (state.statusMap.marketsActionsMap[address].get = {}));

      marketsDynamicData.forEach((marketDynamicData) => {
        const address = marketDynamicData.address;
        state.marketsMap[address] = {
          ...state.marketsMap[address],
          ...marketDynamicData,
        };
      });
    })
    .addCase(getMarketsDynamic.rejected, (state, { meta, error }) => {
      const marketAddresses: string[] = meta.arg.addresses;
      marketAddresses.forEach((address) => {
        state.statusMap.marketsActionsMap[address].get = { error: error.message };
      });
    });
});

export default ironBankReducer;

function checkAndInitUserMarketStatus(state: IronBankState, marketAddress: string) {
  const actionsMap = state.statusMap.user.userMarketsActionsMap[marketAddress];
  if (actionsMap) return;
  state.statusMap.user.userMarketsActionsMap[marketAddress] = { ...initialUserMarketsActionsMap };
}

function parsePositionsIntoMap(positions: Position[]): { [marketAddress: string]: IronBankMarketPositionsMap } {
  const grouped = groupBy(positions, 'assetAddress');
  const marketsMap: { [marketAddress: string]: any } = {};
  Object.entries(grouped).forEach(([key, value]) => {
    marketsMap[key] = keyBy(value, 'typeId');
  });
  return marketsMap;
}
