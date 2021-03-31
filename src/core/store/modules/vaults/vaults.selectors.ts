import { createSelector } from '@reduxjs/toolkit';
import { RootState, Vault } from '@types';

const selectVaultsState = (state: RootState) => state.vaults;
const selectUserVaultsMap = (state: RootState) => state.user.userVaultsMap;
const selectUserTokensMap = (state: RootState) => state.user.userTokensMap;
const selectTokensMap = (state: RootState) => state.tokens.tokensMap;
const selectSelectedVaultAddress = (state: RootState) => state.vaults.selectedVaultAddress;

export const selectSaveVaults = createSelector(
  [selectVaultsState, selectTokensMap, selectUserVaultsMap, selectUserTokensMap],
  (vaultsState, tokensMap, userVaultsMap, userTokensMap): Vault[] => {
    const { saveVaultsAddreses, vaultsMap } = vaultsState;
    const vaults: Vault[] = saveVaultsAddreses.map((address) => {
      const vaultData = vaultsMap[address];
      const tokenData = tokensMap[vaultData.token];
      const userVaultData = userVaultsMap[address];
      const userTokenData = userTokensMap[vaultData.token];
      return {
        address: vaultData.address,
        name: vaultData.name,
        vaultBalance: vaultData.balance,
        vaultBalanceUsdc: vaultData.balanceUsdc,
        depositLimit: vaultData.depositLimit,
        apyData: vaultData.apyData,
        userDeposited: userVaultData?.depositedBalance ?? '0',
        userDepositedUsdc: userVaultData?.depositedBalanceUsdc ?? '0',
        allowancesMap: userVaultData?.allowancesMap ?? {},
        token: {
          address: tokenData?.address,
          name: tokenData?.name,
          symbol: tokenData?.symbol,
          decimals: tokenData?.decimals,
          icon: tokenData?.icon,
          balance: userTokenData?.balance ?? '0',
          balanceUsdc: userTokenData?.balanceUsdc ?? '0',
          allowancesMap: userTokenData?.allowancesMap ?? '0',
        },
      };
    });
    return vaults;
  }
);

export const selectSelectedVault = createSelector(
  [selectSaveVaults, selectSelectedVaultAddress],
  (vaults, selectedVaultAddress): Vault | undefined => {
    if (!selectedVaultAddress) {
      return undefined;
    }
    const selectedVault = vaults.find((vault) => vault.address === selectedVaultAddress);
    return selectedVault;
  }
);
