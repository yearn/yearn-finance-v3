import { createReducer } from '@reduxjs/toolkit';
import { difference, groupBy, keyBy, union } from 'lodash';

import {
  initialStatus,
  VaultsState,
  VaultPositionsMap,
  Position,
  UserVaultActionsStatusMap,
  VaultActionsStatusMap,
  VaultTransaction,
} from '@types';

import { VaultsActions } from './vaults.actions';

export const initialVaultActionsStatusMap: VaultActionsStatusMap = {
  get: initialStatus,
  approve: initialStatus,
  deposit: initialStatus,
  approveZapOut: initialStatus,
  signZapOut: initialStatus,
  withdraw: initialStatus,
  approveMigrate: initialStatus,
  migrate: initialStatus,
};

export const initialUserVaultsActionsStatusMap: UserVaultActionsStatusMap = {
  getPosition: initialStatus,
  getMetadata: initialStatus,
};

export const initialTransaction: VaultTransaction = {
  expectedOutcome: undefined,
};

export const vaultsInitialState: VaultsState = {
  vaultsAddresses: [],
  vaultsMap: {},
  selectedVaultAddress: undefined,
  transaction: initialTransaction,
  user: {
    userVaultsSummary: undefined,
    userVaultsPositionsMap: {},
    userVaultsMetadataMap: {},
    vaultsAllowancesMap: {},
  },
  statusMap: {
    initiateSaveVaults: initialStatus,
    getVaults: initialStatus,
    vaultsActionsStatusMap: {},
    getExpectedTransactionOutcome: initialStatus,
    user: {
      getUserVaultsSummary: initialStatus,
      getUserVaultsPositions: initialStatus,
      getUserVaultsMetadata: initialStatus,
      userVaultsActionsStatusMap: {},
    },
  },
};

const {
  approveDeposit,
  depositVault,
  approveZapOut,
  signZapOut,
  withdrawVault,
  approveMigrate,
  migrateVault,
  getVaults,
  initiateSaveVaults,
  setSelectedVaultAddress,
  getVaultsDynamic,
  getUserVaultsPositions,
  clearVaultsData,
  clearUserData,
  getExpectedTransactionOutcome,
  clearTransactionData,
  getUserVaultsSummary,
  getUserVaultsMetadata,
  clearSelectedVaultAndStatus,
  clearVaultStatus,
} = VaultsActions;

const vaultsReducer = createReducer(vaultsInitialState, (builder) => {
  builder

    /* -------------------------------------------------------------------------- */
    /*                                   Setters                                  */
    /* -------------------------------------------------------------------------- */
    .addCase(setSelectedVaultAddress, (state, { payload: { vaultAddress } }) => {
      state.selectedVaultAddress = vaultAddress;
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Clear State                                */
    /* -------------------------------------------------------------------------- */
    .addCase(clearVaultsData, (state) => {
      state.vaultsMap = {};
      state.vaultsAddresses = [];
    })
    .addCase(clearUserData, (state) => {
      state.user.userVaultsPositionsMap = {};
      state.user.vaultsAllowancesMap = {};
      state.user.userVaultsMetadataMap = {};
      state.user.userVaultsSummary = undefined;
    })

    .addCase(clearTransactionData, (state) => {
      state.transaction = initialTransaction;
      state.statusMap.getExpectedTransactionOutcome = {};
    })

    .addCase(clearSelectedVaultAndStatus, (state) => {
      if (!state.selectedVaultAddress) return;
      const currentAddress = state.selectedVaultAddress;
      state.statusMap.vaultsActionsStatusMap[currentAddress] = initialVaultActionsStatusMap;
      state.selectedVaultAddress = undefined;
    })

    .addCase(clearVaultStatus, (state, { payload: { vaultAddress } }) => {
      state.statusMap.vaultsActionsStatusMap[vaultAddress] = initialVaultActionsStatusMap;
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Fetch data                                 */
    /* -------------------------------------------------------------------------- */

    /* --------------------------- initiateSaveVaults --------------------------- */
    .addCase(initiateSaveVaults.pending, (state) => {
      state.statusMap.initiateSaveVaults = { loading: true };
    })
    .addCase(initiateSaveVaults.fulfilled, (state) => {
      state.statusMap.initiateSaveVaults = {};
    })
    .addCase(initiateSaveVaults.rejected, (state, { error }) => {
      state.statusMap.initiateSaveVaults = { error: error.message };
    })

    /* -------------------------------- getVaults ------------------------------- */
    .addCase(getVaults.pending, (state) => {
      state.statusMap.getVaults = { loading: true };
    })
    .addCase(getVaults.fulfilled, (state, { payload: { vaultsData } }) => {
      const vaultsAddresses: string[] = [];
      vaultsData.forEach((vault) => {
        vaultsAddresses.push(vault.address);
        state.vaultsMap[vault.address] = vault;
        state.statusMap.vaultsActionsStatusMap[vault.address] = initialVaultActionsStatusMap;
        state.statusMap.user.userVaultsActionsStatusMap[vault.address] = initialUserVaultsActionsStatusMap;
      });
      state.vaultsAddresses = union(state.vaultsAddresses, vaultsAddresses);
      state.statusMap.getVaults = {};
    })
    .addCase(getVaults.rejected, (state, { error }) => {
      state.statusMap.getVaults = { error: error.message };
    })

    /* ------------------------- getUserVaultsPositions ------------------------- */
    .addCase(getUserVaultsPositions.pending, (state, { meta }) => {
      const vaultAddresses = meta.arg.vaultAddresses || [];
      vaultAddresses.forEach((address) => {
        checkAndInitUserVaultStatus(state, address);
        state.statusMap.user.userVaultsActionsStatusMap[address].getPosition = { loading: true };
      });
      state.statusMap.user.getUserVaultsPositions = { loading: true };
    })
    .addCase(getUserVaultsPositions.fulfilled, (state, { meta, payload: { userVaultsPositions } }) => {
      const vaultsPositionsMap = parsePositionsIntoMap(userVaultsPositions);
      const vaultAddresses = meta.arg.vaultAddresses;
      vaultAddresses?.forEach((address) => {
        state.statusMap.user.userVaultsActionsStatusMap[address].getPosition = {};
      });

      const positionsAddresses: string[] = [];

      userVaultsPositions.forEach((position) => {
        const address = position.assetAddress;
        positionsAddresses.push(address);
        const allowancesMap: any = {};
        position.assetAllowances.forEach((allowance) => (allowancesMap[allowance.spender] = allowance.amount));

        state.user.vaultsAllowancesMap[address] = allowancesMap;
      });

      const notIncludedAddresses = difference(vaultAddresses ?? [], positionsAddresses);
      if (!positionsAddresses.length || notIncludedAddresses.length) {
        const addresses = union(positionsAddresses, notIncludedAddresses);
        addresses.forEach((address) => {
          const userVaultsPositionsMapClone = { ...state.user.userVaultsPositionsMap };
          delete userVaultsPositionsMapClone[address];
          state.user.userVaultsPositionsMap = { ...userVaultsPositionsMapClone };
        });
      } else {
        state.user.userVaultsPositionsMap = { ...state.user.userVaultsPositionsMap, ...vaultsPositionsMap };
      }

      state.statusMap.user.getUserVaultsPositions = {};
    })
    .addCase(getUserVaultsPositions.rejected, (state, { meta, error }) => {
      const vaultAddresses = meta.arg.vaultAddresses || [];
      vaultAddresses.forEach((address) => {
        state.statusMap.user.userVaultsActionsStatusMap[address].getPosition = {};
      });
      state.statusMap.user.getUserVaultsPositions = { error: error.message };
    })

    /* -------------------------- getUserVaultsSummary -------------------------- */
    .addCase(getUserVaultsSummary.pending, (state) => {
      state.statusMap.user.getUserVaultsSummary = { loading: true };
    })
    .addCase(getUserVaultsSummary.fulfilled, (state, { payload: { userVaultsSummary } }) => {
      state.user.userVaultsSummary = userVaultsSummary;
      state.statusMap.user.getUserVaultsSummary = {};
    })
    .addCase(getUserVaultsSummary.rejected, (state, { error }) => {
      state.statusMap.user.getUserVaultsSummary = { error: error.message };
    })

    /* -------------------------- getUserVaultsMetadata ------------------------- */
    .addCase(getUserVaultsMetadata.pending, (state, { meta }) => {
      const vaultsAddresses = meta.arg.vaultsAddresses || [];
      vaultsAddresses.forEach((address) => {
        checkAndInitUserVaultStatus(state, address);
        state.statusMap.user.userVaultsActionsStatusMap[address].getMetadata = { loading: true };
      });
      state.statusMap.user.getUserVaultsMetadata = { loading: true };
    })
    .addCase(getUserVaultsMetadata.fulfilled, (state, { meta, payload: { userVaultsMetadata } }) => {
      const vaultsAddresses = meta.arg.vaultsAddresses || [];
      vaultsAddresses.forEach((address) => {
        checkAndInitUserVaultStatus(state, address);
        state.statusMap.user.userVaultsActionsStatusMap[address].getMetadata = {};
      });

      userVaultsMetadata.forEach((metadata) => {
        state.user.userVaultsMetadataMap[metadata.assetAddress] = metadata;
      });
      state.statusMap.user.getUserVaultsMetadata = {};
    })
    .addCase(getUserVaultsMetadata.rejected, (state, { meta, error }) => {
      const vaultsAddresses = meta.arg.vaultsAddresses || [];
      vaultsAddresses.forEach((address) => {
        state.statusMap.user.userVaultsActionsStatusMap[address].getMetadata = {};
      });
      state.statusMap.user.getUserVaultsMetadata = { error: error.message };
    })

    /* ---------------------------- getVaultsDynamic ---------------------------- */
    .addCase(getVaultsDynamic.pending, (state, { meta }) => {
      const vaultAddresses = meta.arg.addresses;
      vaultAddresses.forEach((address) => {
        state.statusMap.vaultsActionsStatusMap[address].get = { loading: true };
      });
    })
    .addCase(getVaultsDynamic.fulfilled, (state, { meta, payload: { vaultsDynamicData } }) => {
      const vaultAddresses = meta.arg.addresses;
      vaultAddresses.forEach((address) => (state.statusMap.vaultsActionsStatusMap[address].get = {}));

      vaultsDynamicData.forEach((vaultDynamicData) => {
        const vaultAddress = vaultDynamicData.address;
        state.vaultsMap[vaultAddress] = {
          ...state.vaultsMap[vaultAddress],
          ...vaultDynamicData,
        };
      });
    })
    .addCase(getVaultsDynamic.rejected, (state, { error, meta }) => {
      const vaultAddresses = meta.arg.addresses;
      vaultAddresses.forEach((address) => {
        state.statusMap.vaultsActionsStatusMap[address].get = { error: error.message };
      });
    })

    /* ---------------------- getExpectedTransactionOutcome --------------------- */
    .addCase(getExpectedTransactionOutcome.pending, (state) => {
      state.transaction = initialTransaction;
      state.statusMap.getExpectedTransactionOutcome = { loading: true };
    })
    .addCase(getExpectedTransactionOutcome.fulfilled, (state, { payload: { txOutcome } }) => {
      state.transaction.expectedOutcome = txOutcome;
      state.statusMap.getExpectedTransactionOutcome = {};
    })
    .addCase(getExpectedTransactionOutcome.rejected, (state, { error }) => {
      state.statusMap.getExpectedTransactionOutcome = { error: error.message };
    })

    /* -------------------------------------------------------------------------- */
    /*                                Transactions                                */
    /* -------------------------------------------------------------------------- */

    /* ----------------------------- approveDeposit ----------------------------- */
    .addCase(approveDeposit.pending, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approve = { loading: true };
    })
    .addCase(approveDeposit.fulfilled, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approve = {};
    })
    .addCase(approveDeposit.rejected, (state, { error, meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approve = { error: error.message };
    })

    /* ------------------------------ depositVault ------------------------------ */
    .addCase(depositVault.pending, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].deposit = { loading: true };
    })
    .addCase(depositVault.fulfilled, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].deposit = {};
    })
    .addCase(depositVault.rejected, (state, { error, meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].deposit = { error: error.message };
    })

    /* ------------------------------ approveZapOut ----------------------------- */
    .addCase(approveZapOut.pending, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approveZapOut = { loading: true };
    })
    .addCase(approveZapOut.fulfilled, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approveZapOut = {};
    })
    .addCase(approveZapOut.rejected, (state, { error, meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approveZapOut = { error: error.message };
    })

    /* ------------------------------ signZapOut ----------------------------- */
    .addCase(signZapOut.pending, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].signZapOut = { loading: true };
    })
    .addCase(signZapOut.fulfilled, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].signZapOut = {};
    })
    .addCase(signZapOut.rejected, (state, { error, meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].signZapOut = { error: error.message };
    })

    /* ------------------------------ withdrawVault ----------------------------- */
    .addCase(withdrawVault.pending, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].withdraw = { loading: true };
    })
    .addCase(withdrawVault.fulfilled, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].withdraw = {};
    })
    .addCase(withdrawVault.rejected, (state, { error, meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].withdraw = { error: error.message };
    })

    /* ----------------------------- approveMigrate ----------------------------- */
    .addCase(approveMigrate.pending, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultFromAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approveMigrate = { loading: true };
    })
    .addCase(approveMigrate.fulfilled, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultFromAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approveMigrate = {};
    })
    .addCase(approveMigrate.rejected, (state, { error, meta }) => {
      const vaultAddress = meta.arg.vaultFromAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approveMigrate = { error: error.message };
    })

    /* ------------------------------ migrateVault ------------------------------ */
    .addCase(migrateVault.pending, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultFromAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].migrate = { loading: true };
    })
    .addCase(migrateVault.fulfilled, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultFromAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].migrate = {};
    })
    .addCase(migrateVault.rejected, (state, { error, meta }) => {
      const vaultAddress = meta.arg.vaultFromAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].migrate = { error: error.message };
    });
});

function parsePositionsIntoMap(positions: Position[]): { [vaultAddress: string]: VaultPositionsMap } {
  const grouped = groupBy(positions, 'assetAddress');
  const vaultsMap: { [vaultAddress: string]: any } = {};
  Object.entries(grouped).forEach(([key, value]) => {
    vaultsMap[key] = keyBy(value, 'typeId');
  });
  return vaultsMap;
}

function checkAndInitUserVaultStatus(state: VaultsState, vaultAddress: string) {
  const actionsMap = state.statusMap.user.userVaultsActionsStatusMap[vaultAddress];
  if (actionsMap) return;
  state.statusMap.user.userVaultsActionsStatusMap[vaultAddress] = { ...initialUserVaultsActionsStatusMap };
}

export default vaultsReducer;
