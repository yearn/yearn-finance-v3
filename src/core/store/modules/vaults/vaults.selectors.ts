import { createSelector } from '@reduxjs/toolkit';
import { RootState, Status, VaultView, VaultActionsStatusMap, VaultRecommendation } from '@types';
import BigNumber from 'bignumber.js';
import { initialVaultActionsStatusMap } from './vaults.reducer';

const selectVaultsState = (state: RootState) => state.vaults;
const selectUserVaultsPositionsMap = (state: RootState) => state.vaults.user.userVaultsPositionsMap;
const selectVaultsMap = (state: RootState) => state.vaults.vaultsMap;
const selectVaultsAddresses = (state: RootState) => state.vaults.vaultsAddresses;
const selectUserTokensMap = (state: RootState) => state.tokens.user.userTokensMap;
const selectUserTokensAllowancesMap = (state: RootState) => state.tokens.user.userTokensAllowancesMap;
const selectVaultsAllowancesMap = (state: RootState) => state.vaults.user.vaultsAllowancesMap;
const selectTokensMap = (state: RootState) => state.tokens.tokensMap;
const selectSelectedVaultAddress = (state: RootState) => state.vaults.selectedVaultAddress;
const selectVaultsActionsStatusMap = (state: RootState) => state.vaults.statusMap.vaultsActionsStatusMap;
const selectVaultsStatusMap = (state: RootState) => state.vaults.statusMap;

const selectVaults = createSelector(
  [
    selectVaultsMap,
    selectVaultsAddresses,
    selectTokensMap,
    selectUserVaultsPositionsMap,
    selectUserTokensMap,
    selectVaultsAllowancesMap,
    selectUserTokensAllowancesMap,
  ],
  (
    vaultsMap,
    vaultsAddresses,
    tokensMap,
    userVaultsPositionsMap,
    userTokensMap,
    vaultsAllowancesMap,
    userTokensAllowancesMap
  ) => {
    const vaults = vaultsAddresses.map((address) => {
      const vaultData = vaultsMap[address];
      const tokenData = tokensMap[vaultData.tokenId];
      const userVaultDataDeposit = userVaultsPositionsMap[address]?.DEPOSIT;
      const userTokenData = userTokensMap[vaultData.tokenId];
      const allowancesMap = userTokensAllowancesMap[vaultData.token] ?? {};
      const currentAllowance = allowancesMap[address] ?? '0';
      return {
        address: vaultData.address,
        name: vaultData.name,
        vaultBalance: vaultData.underlyingTokenBalance.amount,
        decimals: vaultData.decimals,
        vaultBalanceUsdc: vaultData.underlyingTokenBalance.amountUsdc,
        depositLimit: vaultData.metadata.depositLimit,
        apyData: vaultData.metadata.apy?.recommended.toString() ?? '0',
        allowancesMap: vaultsAllowancesMap[address] ?? {},
        approved: new BigNumber(currentAllowance).gt(0),
        DEPOSIT: {
          userBalance: userVaultDataDeposit?.balance ?? '0',
          userDeposited: userVaultDataDeposit?.underlyingTokenBalance.amount ?? '0',
          userDepositedUsdc: userVaultDataDeposit?.underlyingTokenBalance.amountUsdc ?? '0',
        },
        token: {
          address: tokenData?.address,
          name: tokenData?.name,
          symbol: tokenData?.symbol,
          decimals: parseInt(tokenData?.decimals),
          icon: tokenData?.icon,
          balance: userTokenData?.balance ?? '0',
          balanceUsdc: userTokenData?.balanceUsdc ?? '0',
          priceUsdc: tokenData?.priceUsdc ?? '0',
          allowancesMap: allowancesMap,
        },
      };
    });
    return vaults;
  }
);

const selectDepositedVaults = createSelector([selectVaults], (vaults): VaultView[] => {
  const depositVaults = vaults.map(({ DEPOSIT, token, ...rest }) => ({ token, ...DEPOSIT, ...rest }));
  return depositVaults.filter((vault) => new BigNumber(vault.userDeposited).gt(0));
});

const selectVaultsOportunities = createSelector([selectVaults], (vaults): VaultView[] => {
  const depositVaults = vaults.map(({ DEPOSIT, token, ...rest }) => ({ token, ...DEPOSIT, ...rest }));
  const opportunities = depositVaults.filter((vault) => new BigNumber(vault.userDeposited).lte(0));

  return opportunities;
});

const selectVaultsGeneralStatus = createSelector(
  [selectVaultsStatusMap],
  (statusMap): Status => {
    const loading = statusMap.getVaults.loading || statusMap.initiateSaveVaults.loading;
    const error = statusMap.getVaults.error || statusMap.initiateSaveVaults.error;
    return { loading, error };
  }
);

const selectSelectedVault = createSelector(
  [selectVaults, selectSelectedVaultAddress],
  (vaults, selectedVaultAddress) => {
    if (!selectedVaultAddress) {
      return undefined;
    }
    return vaults.find((vault) => vault.address === selectedVaultAddress);
  }
);

const selectSelectedVaultActionsStatusMap = createSelector(
  [selectVaultsActionsStatusMap, selectSelectedVaultAddress],
  (vaultsActionsStatusMap, selectedVaultAddress): VaultActionsStatusMap => {
    return selectedVaultAddress ? vaultsActionsStatusMap[selectedVaultAddress] : initialVaultActionsStatusMap;
  }
);

const selectSummaryData = createSelector(
  [selectVaultsActionsStatusMap, selectSelectedVaultAddress],
  (vaultsActionsStatusMap, selectedVaultAddress) => {
    return {
      totalDeposits: '999999',
      totalEarnings: '200000',
      estYearlyYeild: '90000',
    };
  }
);

const selectRecomendations = createSelector([selectVaults], (vaults) => {
  return [vaults[0], vaults[5], vaults[8]].filter((item) => !!item);
});

export const VaultsSelectors = {
  selectVaultsState,
  selectVaults,
  selectUserVaultsPositionsMap,
  selectUserTokensMap,
  selectTokensMap,
  selectSelectedVaultAddress,
  selectVaultsActionsStatusMap,
  selectVaultsStatusMap,
  selectVaultsGeneralStatus,
  selectSelectedVault,
  selectSelectedVaultActionsStatusMap,
  selectDepositedVaults,
  selectVaultsOportunities,
  selectSummaryData,
  selectRecomendations,
};
