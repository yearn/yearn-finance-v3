import { createSelector } from '@reduxjs/toolkit';
import { memoize } from 'lodash';

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
  Address,
  GeneralVaultView,
} from '@types';
import { toBN } from '@utils';

import { createToken } from '../tokens/tokens.selectors';

import { initialVaultActionsStatusMap } from './vaults.reducer';

/* ---------------------------------- State --------------------------------- */
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

const selectGetVaultsStatus = (state: RootState) => state.vaults.statusMap.getVaults;
const selectGetUserVaultsPositionsStatus = (state: RootState) => state.vaults.statusMap.user.getUserVaultsPositions;

/* ----------------------------- Main Selectors ----------------------------- */
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
    vaultsAllowancesMap, // NOTE: For now we are gonna get the allowance from TokenState.user.tokenAllowances[]
    userTokensAllowancesMap
  ) => {
    const vaults = vaultsAddresses.map((address) => {
      const vaultData = vaultsMap[address];
      const tokenData = tokensMap[vaultData.tokenId];
      const userTokenData = userTokensMap[vaultData.tokenId];
      const tokenAllowancesMap = userTokensAllowancesMap[vaultData.token] ?? {};
      const vaultAllowancesMap = userTokensAllowancesMap[address] ?? {};
      return createVault({
        vaultData,
        tokenData,
        userTokenData,
        userVaultPositionsMap: userVaultsPositionsMap[address],
        userVaultsMetadataMap: userVaultsMetadataMap[address],
        vaultAllowancesMap,
        tokenAllowancesMap,
      });
    });

    vaults.sort((a, b) => {
      return toBN(b.token.balance).minus(a.token.balance).toNumber();
    });
    return vaults;
  }
);

const selectLiveVaults = createSelector([selectVaults], (vaults): GeneralVaultView[] => {
  return vaults.filter((vault) => !vault.hideIfNoDeposits);
});

const selectDeprecatedVaults = createSelector([selectVaults], (vaults): VaultView[] => {
  const deprecatedVaults = vaults
    .filter((vault) => vault.hideIfNoDeposits)
    .map(({ DEPOSIT, token, ...rest }) => ({ token, ...DEPOSIT, ...rest }));
  return deprecatedVaults.filter((vault) => toBN(vault.userDeposited).gt(0));
});

const selectDepositedVaults = createSelector([selectLiveVaults], (vaults): VaultView[] => {
  const depositVaults = vaults.map(({ DEPOSIT, token, ...rest }) => ({ token, ...DEPOSIT, ...rest }));
  return depositVaults.filter((vault) => toBN(vault.userDeposited).gt(0));
});

const selectVaultsOpportunities = createSelector([selectLiveVaults], (vaults): VaultView[] => {
  const depositVaults = vaults.map(({ DEPOSIT, token, ...rest }) => ({ token, ...DEPOSIT, ...rest }));
  const opportunities = depositVaults.filter((vault) => toBN(vault.userDeposited).lte(0));

  return opportunities;
});

const selectSelectedVaultActionsStatusMap = createSelector(
  [selectVaultsActionsStatusMap, selectSelectedVaultAddress],
  (vaultsActionsStatusMap, selectedVaultAddress): VaultActionsStatusMap => {
    return selectedVaultAddress ? vaultsActionsStatusMap[selectedVaultAddress] : initialVaultActionsStatusMap;
  }
);

const selectSummaryData = createSelector([selectUserVaultsSummary], (userVaultsSummary) => {
  return {
    totalDeposits: userVaultsSummary?.holdings ?? '0',
    totalEarnings: userVaultsSummary?.earnings ?? '0',
    estYearlyYeild: userVaultsSummary?.estimatedYearlyYield ?? '0',
    apy: userVaultsSummary?.grossApy.toString() ?? '0',
  };
});

const selectRecommendations = createSelector([selectLiveVaults], (vaults) => {
  // const stableCoinsSymbols = ['DAI', 'USDC', 'USDT', 'sUSD'];
  // const stableVaults: GeneralVaultView[] = [];
  // stableCoinsSymbols.forEach((symbol) => {
  //   const vault = vaults.find((vault) => vault.token.symbol === symbol);
  //   if (!vault) return;
  //   stableVaults.push(vault);
  // });

  // let max = toBN('0');
  // let stableVault: GeneralVaultView = stableVaults[0];
  // stableVaults.forEach((vault) => {
  //   if (max.gte(vault.apyData)) return;
  //   max = toBN(vault.apyData);
  //   stableVault = vault;
  // });

  // const derivativeVaults = differenceBy(vaults, stableVaults, 'address');

  // derivativeVaults.sort((a, b) => {
  //   return toBN(b.apyData).minus(a.apyData).toNumber();
  // });

  // return [stableVault, derivativeVaults[1], derivativeVaults[0]].filter((item) => !!item);
  const sortedVaults = [...vaults].sort((a, b) => {
    return toBN(b.apyData).minus(a.apyData).toNumber();
  });
  return sortedVaults.slice(0, 3);
});

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
    vaultsAllowancesMap, // NOTE: For now we are gonna get the allowance from TokenState.user.tokenAllowances[]
    userTokensAllowancesMap
  ) =>
    memoize((vaultAddress: string) => {
      const vaultData = vaultsMap[vaultAddress];
      if (!vaultData) return undefined;
      const tokenData = tokensMap[vaultData.tokenId];
      const userTokenData = userTokensMap[vaultData.tokenId];
      const tokenAllowancesMap = userTokensAllowancesMap[vaultData.token] ?? {};
      const vaultAllowancesMap = userTokensAllowancesMap[vaultAddress] ?? {};
      return createVault({
        vaultData,
        tokenData,
        userTokenData,
        userVaultPositionsMap: userVaultsPositionsMap[vaultAddress],
        userVaultsMetadataMap: userVaultsMetadataMap[vaultAddress],
        vaultAllowancesMap,
        tokenAllowancesMap,
      });
    })
);

const selectUnderlyingTokensAddresses = createSelector([selectVaultsMap], (vaults): Address[] => {
  return Object.values(vaults).map((vault) => vault.tokenId);
});

/* -------------------------------- Statuses -------------------------------- */
const selectVaultsGeneralStatus = createSelector([selectVaultsStatusMap], (statusMap): Status => {
  const loading = statusMap.getVaults.loading || statusMap.initiateSaveVaults.loading;
  const error = statusMap.getVaults.error || statusMap.initiateSaveVaults.error;
  return { loading, error };
});

const selectSelectedVault = createSelector(
  [selectVaults, selectSelectedVaultAddress],
  (vaults, selectedVaultAddress) => {
    if (!selectedVaultAddress) {
      return undefined;
    }
    return vaults.find((vault) => vault.address === selectedVaultAddress);
  }
);

const selectVaultsStatus = createSelector(
  [selectGetVaultsStatus, selectGetUserVaultsPositionsStatus],
  (getVaultsStatus, getUserVaultsPositionsStatus): Status => {
    return {
      loading: getVaultsStatus.loading || getUserVaultsPositionsStatus.loading,
      error: getVaultsStatus.error || getUserVaultsPositionsStatus.error,
    };
  }
);

/* --------------------------------- Helper --------------------------------- */
interface CreateVaultProps {
  vaultData: Vault;
  tokenData: Token;
  userTokenData: Balance;
  tokenAllowancesMap: AllowancesMap;
  userVaultPositionsMap: VaultPositionsMap;
  userVaultsMetadataMap: VaultUserMetadata;
  vaultAllowancesMap: AllowancesMap;
}

function createVault(props: CreateVaultProps): GeneralVaultView {
  const {
    tokenAllowancesMap,
    tokenData,
    userTokenData,
    vaultData,
    vaultAllowancesMap,
    userVaultPositionsMap,
    userVaultsMetadataMap,
  } = props;
  const vaultAddress = vaultData.address;
  const currentAllowance = tokenAllowancesMap[vaultAddress] ?? '0';

  return {
    address: vaultData.address,
    name: vaultData.name,
    displayName: vaultData.metadata.displayName,
    displayIcon: vaultData.metadata.displayIcon,
    defaultDisplayToken: vaultData.metadata.defaultDisplayToken,
    vaultBalance: vaultData.underlyingTokenBalance.amount,
    decimals: vaultData.decimals,
    symbol: vaultData.symbol,
    vaultBalanceUsdc: vaultData.underlyingTokenBalance.amountUsdc,
    depositLimit: vaultData.metadata.depositLimit ?? '0',
    emergencyShutdown: vaultData.metadata.emergencyShutdown,
    depositsDisabled: vaultData.metadata.depositsDisabled || vaultData.metadata.hideIfNoDeposits,
    withdrawalsDisabled: vaultData.metadata.withdrawalsDisabled ?? false,
    hideIfNoDeposits: vaultData.metadata.hideIfNoDeposits ?? false,
    apyData: vaultData.metadata.apy?.net_apy.toString() ?? '0',
    apyType: vaultData.metadata.apy?.type ?? '',
    apyMetadata: vaultData.metadata.apy,
    allowancesMap: vaultAllowancesMap ?? {},
    approved: toBN(currentAllowance).gt(0),
    pricePerShare: vaultData?.metadata.pricePerShare,
    earned: userVaultsMetadataMap?.earned ?? '0',
    strategies: vaultData.metadata.strategies?.strategiesMetadata ?? [],
    historicalEarnings: vaultData.metadata.historicEarnings ?? [],
    allowZapIn: !!vaultData.metadata.allowZapIn,
    allowZapOut: !!vaultData.metadata.allowZapOut,
    zapInWith: vaultData.metadata.zapInWith,
    zapOutWith: vaultData.metadata.zapOutWith,
    migrationAvailable: vaultData.metadata.migrationAvailable,
    migrationContract: vaultData.metadata.migrationContract,
    migrationTargetVault: vaultData.metadata.migrationTargetVault,
    DEPOSIT: {
      userBalance: userVaultPositionsMap?.DEPOSIT?.balance ?? '0',
      userDeposited: userVaultPositionsMap?.DEPOSIT?.underlyingTokenBalance.amount ?? '0',
      userDepositedUsdc: userVaultPositionsMap?.DEPOSIT?.underlyingTokenBalance.amountUsdc ?? '0',
    },
    token: createToken({ tokenData, userTokenData, allowancesMap: tokenAllowancesMap }),
  };
}

export const VaultsSelectors = {
  selectVaultsState,
  selectVaultsMap,
  selectVaults,
  selectLiveVaults,
  selectDeprecatedVaults,
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
  selectUnderlyingTokensAddresses,
};
