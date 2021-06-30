import { createSelector } from '@reduxjs/toolkit';
import {
  RootState,
  Status,
  VaultView,
  VaultActionsStatusMap,
  Vault,
  Token,
  Balance,
  AllowancesMap,
  VaultPositionsMap,
  VaultUserMetadata,
} from '@types';
import BigNumber from 'bignumber.js';
import { memoize } from 'lodash';
import { initialVaultActionsStatusMap } from './vaults.reducer';

const selectVaultsState = (state: RootState) => state.vaults;
const selectUserVaultsPositionsMap = (state: RootState) => state.vaults.user.userVaultsPositionsMap;
const selectUserVaultsMetadataMap = (state: RootState) => state.vaults.user.userVaultsMetadataMap;
const selectVaultsMap = (state: RootState) => state.vaults.vaultsMap;
const selectVaultsAddresses = (state: RootState) => state.vaults.vaultsAddresses;
const selectUserTokensMap = (state: RootState) => state.tokens.user.userTokensMap;
const selectUserTokensAllowancesMap = (state: RootState) => state.tokens.user.userTokensAllowancesMap;
const selectVaultsAllowancesMap = (state: RootState) => state.vaults.user.vaultsAllowancesMap;
const selectTokensMap = (state: RootState) => state.tokens.tokensMap;
const selectSelectedVaultAddress = (state: RootState) => state.vaults.selectedVaultAddress;
const selectVaultsActionsStatusMap = (state: RootState) => state.vaults.statusMap.vaultsActionsStatusMap;
const selectVaultsStatusMap = (state: RootState) => state.vaults.statusMap;
const selectExpectedTxOutcome = (state: RootState) => state.vaults.transaction.expectedOutcome;
const selectExpectedTxOutcomeStatus = (state: RootState) => state.vaults.statusMap.getExpectedTransactionOutcome;
const selectUserVaultsSummary = (state: RootState) => state.vaults.user.userVaultsSummary;
const selectUserVaultsSummaryStatus = (state: RootState) => state.vaults.statusMap.user.getUserVaultsSummary;

const selectGetVaultsStatus = (state: RootState) => state.vaults.statusMap.getVaults;
const selectGetUserVaultsPositionsStatus = (state: RootState) => state.vaults.statusMap.user.getUserVaultsPositions;

const selectVaults = createSelector(
  [
    selectVaultsMap,
    selectVaultsAddresses,
    selectTokensMap,
    selectUserVaultsPositionsMap,
    selectUserVaultsMetadataMap,
    selectUserTokensMap,
    selectVaultsAllowancesMap,
    selectUserTokensAllowancesMap,
  ],
  (
    vaultsMap,
    vaultsAddresses,
    tokensMap,
    userVaultsPositionsMap,
    userVaultsMetadataMap,
    userTokensMap,
    vaultsAllowancesMap,
    userTokensAllowancesMap
  ) => {
    const vaults = vaultsAddresses.map((address) => {
      const vaultData = vaultsMap[address];
      const tokenData = tokensMap[vaultData.tokenId];
      const userTokenData = userTokensMap[vaultData.tokenId];
      const allowancesMap = userTokensAllowancesMap[vaultData.token] ?? {};
      return createVault({
        vaultData,
        tokenData,
        userTokenData,
        userVaultPositionsMap: userVaultsPositionsMap[address],
        userVaultsMetadataMap: userVaultsMetadataMap[address],
        vaultsAllowancesMap,
        allowancesMap,
      });
    });
    return vaults;
  }
);

const selectDepositedVaults = createSelector([selectVaults], (vaults): VaultView[] => {
  const depositVaults = vaults.map(({ DEPOSIT, token, ...rest }) => ({ token, ...DEPOSIT, ...rest }));
  return depositVaults.filter((vault) => new BigNumber(vault.userDeposited).gt(0));
});

const selectVaultsOpportunities = createSelector([selectVaults], (vaults): VaultView[] => {
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

const selectSummaryData = createSelector([selectDepositedVaults], (depositedVaults) => {
  let totalDeposited: BigNumber = new BigNumber('0');
  depositedVaults.forEach((vault) => (totalDeposited = totalDeposited.plus(vault.userDepositedUsdc)));

  return {
    totalDeposits: totalDeposited.toString(),
    totalEarnings: '0',
    estYearlyYeild: '0',
  };
});

const selectRecommendations = createSelector([selectVaults], (vaults) => {
  return [vaults[0], vaults[5], vaults[8]].filter((item) => !!item);
});

const selectVaultsStatus = createSelector(
  [selectGetVaultsStatus, selectGetUserVaultsPositionsStatus],
  (getVaultsStatus, getUserVaultsPositionsStatus): Status => {
    return {
      loading: getVaultsStatus.loading || getUserVaultsPositionsStatus.loading,
      error: getVaultsStatus.error || getUserVaultsPositionsStatus.error,
    };
  }
);

const selectVault = createSelector(
  [
    selectVaultsMap,
    selectTokensMap,
    selectUserVaultsPositionsMap,
    selectUserVaultsMetadataMap,
    selectUserTokensMap,
    selectVaultsAllowancesMap,
    selectUserTokensAllowancesMap,
  ],
  (
    vaultsMap,
    tokensMap,
    userVaultsPositionsMap,
    userVaultsMetadataMap,
    userTokensMap,
    vaultsAllowancesMap,
    userTokensAllowancesMap
  ) =>
    memoize((vaultAddress: string) => {
      const vaultData = vaultsMap[vaultAddress];
      if (!vaultData) return undefined;
      const tokenData = tokensMap[vaultData.tokenId];
      const userTokenData = userTokensMap[vaultData.tokenId];
      const allowancesMap = userTokensAllowancesMap[vaultData.token] ?? {};
      return createVault({
        vaultData,
        tokenData,
        userTokenData,
        userVaultPositionsMap: userVaultsPositionsMap[vaultAddress],
        userVaultsMetadataMap: userVaultsMetadataMap[vaultAddress],
        vaultsAllowancesMap,
        allowancesMap,
      });
    })
);
interface CreateVaultProps {
  vaultData: Vault;
  tokenData: Token;
  userTokenData: Balance;
  allowancesMap: AllowancesMap;
  userVaultPositionsMap: VaultPositionsMap;
  userVaultsMetadataMap: VaultUserMetadata;
  vaultsAllowancesMap: any;
}
function createVault(props: CreateVaultProps) {
  const {
    allowancesMap,
    tokenData,
    userTokenData,
    vaultData,
    vaultsAllowancesMap,
    userVaultPositionsMap,
    userVaultsMetadataMap,
  } = props;
  const vaultAddress = vaultData.address;
  const currentAllowance = allowancesMap[vaultAddress] ?? '0';
  return {
    address: vaultData.address,
    name: vaultData.name,
    vaultBalance: vaultData.underlyingTokenBalance.amount,
    decimals: vaultData.decimals,
    vaultBalanceUsdc: vaultData.underlyingTokenBalance.amountUsdc,
    depositLimit: vaultData?.metadata.depositLimit ?? '0',
    emergencyShutdown: vaultData?.metadata.emergencyShutdown ?? false,
    apyData: vaultData.metadata.apy?.recommended.toString() ?? '0',
    allowancesMap: vaultsAllowancesMap[vaultAddress] ?? {},
    approved: new BigNumber(currentAllowance).gt(0),
    pricePerShare: vaultData?.metadata.pricePerShare,
    earned: userVaultsMetadataMap?.earned ?? '0',
    DEPOSIT: {
      userBalance: userVaultPositionsMap?.DEPOSIT?.balance ?? '0',
      userDeposited: userVaultPositionsMap?.DEPOSIT?.underlyingTokenBalance.amount ?? '0',
      userDepositedUsdc: userVaultPositionsMap?.DEPOSIT?.underlyingTokenBalance.amountUsdc ?? '0',
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
}

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
  selectVaultsOpportunities,
  selectSummaryData,
  selectRecommendations,
  selectVaultsStatus,
  selectVault,
  selectExpectedTxOutcome,
  selectExpectedTxOutcomeStatus,
};
