import { createSelector } from '@reduxjs/toolkit';
import { RootState, Status, VaultView, VaultActionsStatusMap } from '@types';
import BigNumber from 'bignumber.js';
import { initialVaultActionsStatusMap } from './vaults.reducer';

const selectVaultsState = (state: RootState) => state.vaults;
const selectUserVaultsMap = (state: RootState) => state.vaults.user.userVaultsMap;
const selectUserTokensMap = (state: RootState) => state.tokens.user.userTokensMap;
const selectTokensMap = (state: RootState) => state.tokens.tokensMap;
const selectSelectedVaultAddress = (state: RootState) => state.vaults.selectedVaultAddress;
const selectVaultsActionsStatusMap = (state: RootState) => state.vaults.statusMap.vaultsActionsStatusMap;
const selectVaultsStatusMap = (state: RootState) => state.vaults.statusMap;

const selectSaveVaults = createSelector(
  [selectVaultsState, selectTokensMap, selectUserVaultsMap, selectUserTokensMap],
  (vaultsState, tokensMap, userVaultsMap, userTokensMap): VaultView[] => {
    const { saveVaultsAddreses, vaultsMap } = vaultsState;
    const vaults: VaultView[] = saveVaultsAddreses.map((address) => {
      const vaultData = vaultsMap[address];
      const tokenData = tokensMap[vaultData.tokenId];
      const userVaultData = userVaultsMap[address];
      const userTokenData = userTokensMap[vaultData.tokenId];
      const currentAllowance: string = userTokenData?.allowancesMap[address] ?? '0';
      return {
        address: vaultData.address,
        name: vaultData.name,
        vaultBalance: vaultData.underlyingTokenBalance.amount,
        vaultBalanceUsdc: vaultData.underlyingTokenBalance.amountUsdc,
        depositLimit: vaultData.metadata.depositLimit,
        apyData: '0',
        // apyData: vaultData.apyData, TODO
        userDeposited: userVaultData?.depositedBalance ?? '0',
        userDepositedUsdc: userVaultData?.depositedBalanceUsdc ?? '0',
        allowancesMap: userVaultData?.allowancesMap ?? {},
        approved: new BigNumber(currentAllowance).gt(0),
        token: {
          address: tokenData?.address,
          name: tokenData?.name,
          symbol: tokenData?.symbol,
          decimals: parseInt(tokenData?.decimals),
          icon: tokenData?.icon,
          balance: userTokenData?.balance ?? '0',
          balanceUsdc: userTokenData?.balanceUsdc ?? '0',
          allowancesMap: userTokenData?.allowancesMap ?? {},
        },
      };
    });
    return vaults;
  }
);

const selectSaveVaultsGeneralStatus = createSelector(
  [selectVaultsStatusMap],
  (statusMap): Status => {
    const loading = statusMap.getVaults.loading || statusMap.initiateSaveVaults.loading;
    const error = statusMap.getVaults.error || statusMap.initiateSaveVaults.error;
    return { loading, error };
  }
);

const selectSelectedVault = createSelector(
  [selectSaveVaults, selectSelectedVaultAddress],
  (vaults, selectedVaultAddress): VaultView | undefined => {
    if (!selectedVaultAddress) {
      return undefined;
    }
    const selectedVault = vaults.find((vault) => vault.address === selectedVaultAddress);
    return selectedVault;
  }
);

const selectSelectedVaultActionsStatusMap = createSelector(
  [selectVaultsActionsStatusMap, selectSelectedVaultAddress],
  (vaultsActionsStatusMap, selectedVaultAddress): VaultActionsStatusMap => {
    return selectedVaultAddress ? vaultsActionsStatusMap[selectedVaultAddress] : initialVaultActionsStatusMap;
  }
);

export const VaultsSelectors = {
  selectVaultsState,
  selectUserVaultsMap,
  selectUserTokensMap,
  selectTokensMap,
  selectSelectedVaultAddress,
  selectVaultsActionsStatusMap,
  selectVaultsStatusMap,
  selectSaveVaults,
  selectSaveVaultsGeneralStatus,
  selectSelectedVault,
  selectSelectedVaultActionsStatusMap,
};
