import { AnyAction, AsyncThunk, createReducer } from '@reduxjs/toolkit';
import {
  MarketActionsStatusMap,
  IronBankState,
  UserMarketActionsStatusMap,
  IronBankMarketPositionsMap,
  Position,
  MarketActionsTypes,
} from '@types';
import { groupBy, keyBy, union } from 'lodash';
import { initialStatus } from '../../../types/Status';
import { IronBankActions } from './ironBank.actions';

export const initialMarketsActionsMap: MarketActionsStatusMap = {
  approve: initialStatus,
  get: initialStatus,
  borrow: initialStatus,
  repay: initialStatus,
  supply: initialStatus,
  enterMarket: initialStatus,
  withdraw: initialStatus,
};

export const initialUserMarketsActionsMap: UserMarketActionsStatusMap = {
  getPosition: initialStatus,
  getMetadata: initialStatus,
};

export const ironBankInitialState: IronBankState = {
  marketAddresses: [],
  marketsMap: {},
  selectedMarketAddress: '',
  user: {
    userIronBankSummary: undefined,
    userMarketsPositionsMap: {},
    userMarketsMetadataMap: {},
    marketsAllowancesMap: {},
  },
  statusMap: {
    initiateIronBank: { ...initialStatus },
    getMarkets: { ...initialStatus },
    marketsActionsMap: {},
    user: {
      getUserIronBankSummary: { ...initialStatus },
      getUserMarketsPositions: { ...initialStatus },
      getUserMarketsMetadata: { ...initialStatus },
      userMarketsActionsMap: {},
    },
  },
};

const {
  initiateIronBank,
  getMarkets,
  getIronBankSummary,
  getUserMarketsPositions,
  getUserMarketsMetadata,
  setSelectedMarketAddress,
  approveMarket,
  getMarketsDynamic,
  enterMarkets,
  clearUserData,
} = IronBankActions;

type GenericAsyncThunk = AsyncThunk<any, any, any>;
type PendingAction = ReturnType<GenericAsyncThunk['pending']>;
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>;
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>;

function isPendingTxAction(action: AnyAction): action is PendingAction {
  return (
    action.type === 'ironBank/supply/pending' ||
    action.type === 'ironBank/borrow/pending' ||
    action.type === 'ironBank/repay/pending' ||
    action.type === 'ironBank/withdraw/pending'
  );
}

function isFulfiledTxAction(action: AnyAction): action is FulfilledAction {
  return (
    action.type === 'ironBank/supply/fulfilled' ||
    action.type === 'ironBank/borrow/fulfilled' ||
    action.type === 'ironBank/repay/fulfilled' ||
    action.type === 'ironBank/withdraw/fulfilled'
  );
}

function isRejectedTxAction(action: AnyAction): action is RejectedAction {
  return (
    action.type === 'ironBank/supply/rejected' ||
    action.type === 'ironBank/borrow/rejected' ||
    action.type === 'ironBank/repay/rejected' ||
    action.type === 'ironBank/withdraw/rejected'
  );
}

const ironBankReducer = createReducer(ironBankInitialState, (builder) => {
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
    .addCase(getIronBankSummary.pending, (state) => {
      state.statusMap.user.getUserIronBankSummary = { loading: true };
    })
    .addCase(getIronBankSummary.fulfilled, (state, { payload: { userIronBankSummary } }) => {
      state.user.userIronBankSummary = userIronBankSummary;
      state.statusMap.user.getUserIronBankSummary = {};
    })
    .addCase(getIronBankSummary.rejected, (state, { error }) => {
      state.statusMap.user.getUserIronBankSummary = { error: error.message };
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
    .addCase(getUserMarketsPositions.pending, (state, { meta }) => {
      const marketAddresses = meta.arg.marketAddresses || [];
      marketAddresses.forEach((address) => {
        checkAndInitUserMarketStatus(state, address);
        state.statusMap.user.userMarketsActionsMap[address].getPosition = { loading: true };
      });
      state.statusMap.user.getUserMarketsPositions = { loading: true };
    })
    .addCase(getUserMarketsPositions.fulfilled, (state, { meta, payload: { userMarketsPositions } }) => {
      const marketsPositionsMap = parsePositionsIntoMap(userMarketsPositions);
      const marketAddresses = meta.arg.marketAddresses;
      marketAddresses?.forEach((address) => {
        state.statusMap.user.userMarketsActionsMap[address].getPosition = {};
      });

      userMarketsPositions.forEach((position) => {
        const address = position.assetAddress;
        const allowancesMap: any = {};
        position.assetAllowances.forEach((allowance) => (allowancesMap[allowance.spender] = allowance.amount));

        state.user.marketsAllowancesMap[address] = allowancesMap;
      });

      state.user.userMarketsPositionsMap = { ...state.user.userMarketsPositionsMap, ...marketsPositionsMap };
      state.statusMap.user.getUserMarketsPositions = {};
    })
    .addCase(getUserMarketsPositions.rejected, (state, { meta, error }) => {
      const marketAddresses = meta.arg.marketAddresses || [];
      marketAddresses.forEach((address) => {
        state.statusMap.user.userMarketsActionsMap[address].getPosition = {};
      });
      state.statusMap.user.getUserMarketsPositions = { error: error.message };
    })
    .addCase(getUserMarketsMetadata.pending, (state, { meta }) => {
      const marketAddresses = meta.arg.marketAddresses || [];
      marketAddresses.forEach((address) => {
        checkAndInitUserMarketStatus(state, address);
        state.statusMap.user.userMarketsActionsMap[address].getMetadata = { loading: true };
      });
      state.statusMap.user.getUserMarketsMetadata = { loading: true };
    })
    .addCase(getUserMarketsMetadata.fulfilled, (state, { meta, payload: { userMarketsMetadata } }) => {
      const marketAddresses = meta.arg.marketAddresses || [];
      marketAddresses.forEach((address) => {
        checkAndInitUserMarketStatus(state, address);
        state.statusMap.user.userMarketsActionsMap[address].getMetadata = {};
      });

      userMarketsMetadata.forEach((metadata) => {
        state.user.userMarketsMetadataMap[metadata.assetAddress] = metadata;
      });
      state.statusMap.user.getUserMarketsMetadata = {};
    })
    .addCase(getUserMarketsMetadata.rejected, (state, { meta, error }) => {
      const marketAddresses = meta.arg.marketAddresses || [];
      marketAddresses.forEach((address) => {
        state.statusMap.user.userMarketsActionsMap[address].getMetadata = {};
      });
      state.statusMap.user.getUserMarketsMetadata = { error: error.message };
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
    })
    .addCase(enterMarkets.pending, (state, { meta }) => {
      const marketAddresses = meta.arg.marketAddresses;
      marketAddresses.forEach((address) => {
        state.statusMap.marketsActionsMap[address].enterMarket = { loading: true };
      });
    })
    .addCase(enterMarkets.fulfilled, (state, { meta }) => {
      const marketAddresses = meta.arg.marketAddresses;
      marketAddresses.forEach((address) => {
        state.statusMap.marketsActionsMap[address].enterMarket = {};
      });
    })
    .addCase(enterMarkets.rejected, (state, { meta, error }) => {
      const marketAddresses = meta.arg.marketAddresses;
      marketAddresses.forEach((address) => {
        state.statusMap.marketsActionsMap[address].enterMarket = { error: error.message };
      });
    })
    .addCase(clearUserData, (state) => {
      state.user.marketsAllowancesMap = {};
      state.user.userMarketsMetadataMap = {};
      state.user.userMarketsPositionsMap = {};
    })
    .addMatcher(isPendingTxAction, (state, { meta, type }) => {
      const marketAddress: string = meta.arg.marketAddress;
      const action = type.split('/')[1] as MarketActionsTypes;
      state.statusMap.marketsActionsMap[marketAddress][action] = { loading: true };
    })
    .addMatcher(isFulfiledTxAction, (state, { meta, type }) => {
      const marketAddress: string = meta.arg.marketAddress;
      const action = type.split('/')[1] as MarketActionsTypes;
      state.statusMap.marketsActionsMap[marketAddress][action] = {};
    })
    .addMatcher(isRejectedTxAction, (state, { meta, type, error }) => {
      const marketAddress: string = meta.arg.marketAddress;
      const action = type.split('/')[1] as MarketActionsTypes;
      const { message } = error as any;
      state.statusMap.marketsActionsMap[marketAddress][action] = { error: message };
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
