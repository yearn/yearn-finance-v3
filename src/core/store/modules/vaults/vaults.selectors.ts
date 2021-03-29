import { createSelector } from '@reduxjs/toolkit';
import { RootState, VaultData } from '@types';

const selectVaultsState = (state: RootState) => state.vaults;

export const selectSaveVaults = createSelector([selectVaultsState], (vaults): VaultData[] => {
  const { saveVaultsAddreses, vaultsMap } = vaults;

  return saveVaultsAddreses.map((address) => vaultsMap[address]);
});
