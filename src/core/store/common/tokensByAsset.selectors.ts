import { createSelector } from '@reduxjs/toolkit';
import { memoize } from 'lodash';

import { toBN } from '@utils';
import { getConfig } from '@config';
import { TokenView } from '@types';

import { VaultsSelectors } from '../modules/vaults/vaults.selectors';
import { LabsSelectors } from '../modules/labs/labs.selectors';
import { TokensSelectors } from '../modules/tokens/tokens.selectors';
import { AppSelectors } from '../modules/app/app.selectors';
import { createToken } from '../modules/tokens/tokens.selectors';
import { NetworkSelectors } from '../modules/network/network.selectors';

const { selectVaultsMap } = VaultsSelectors;
const { selectLabsMap } = LabsSelectors;
const { selectTokensMap, selectTokensUser } = TokensSelectors;
const { selectServicesEnabled } = AppSelectors;
const { selectCurrentNetwork } = NetworkSelectors;

export const selectDepositTokenOptionsByAsset = createSelector(
  [selectVaultsMap, selectLabsMap, selectTokensMap, selectTokensUser, selectServicesEnabled, selectCurrentNetwork],
  (vaultsMap, labsMap, tokensMap, tokensUser, servicesEnabled, currentNetwork) =>
    memoize((assetAddress?: string): TokenView[] => {
      if (!assetAddress) return [];

      const { userTokensAddresses, userTokensMap, userTokensAllowancesMap } = tokensUser;
      const assetData = vaultsMap[assetAddress] ? vaultsMap[assetAddress] : labsMap[assetAddress];
      if (!assetData) return [];

      const { NETWORK_SETTINGS } = getConfig();
      const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
      const zapsDisabled =
        (!servicesEnabled.zaps && assetData.metadata.zapInWith) || !currentNetworkSettings.zapsEnabled;
      const mainVaultTokenAddress = zapsDisabled ? assetData.token : assetData.metadata.defaultDisplayToken;
      const depositTokenAddresses = [mainVaultTokenAddress];
      if (!zapsDisabled) {
        depositTokenAddresses.push(...userTokensAddresses.filter((address) => address !== mainVaultTokenAddress));
      }

      const tokens = depositTokenAddresses
        .filter((address) => !!tokensMap[address])
        .map((address) => {
          const tokenData = tokensMap[address];
          const userTokenData = userTokensMap[address];
          const allowancesMap = userTokensAllowancesMap[address] ?? {};
          return createToken({ tokenData, userTokenData, allowancesMap });
        });
      return tokens.filter(
        (token) =>
          (token.supported[assetData.metadata.zapInWith as keyof TokenView['supported']] &&
            toBN(token.balance).gt(0)) ||
          token.address === mainVaultTokenAddress
      );
    })
);

export const selectWithdrawTokenOptionsByAsset = createSelector(
  [selectVaultsMap, selectLabsMap, selectTokensMap, selectTokensUser, selectServicesEnabled, selectCurrentNetwork],
  (vaultsMap, labsMap, tokensMap, tokensUser, servicesEnabled, currentNetwork) =>
    memoize((assetAddress?: string): TokenView[] => {
      if (!assetAddress) return [];

      const { userTokensMap, userTokensAllowancesMap } = tokensUser;
      const assetData = vaultsMap[assetAddress] ? vaultsMap[assetAddress] : labsMap[assetAddress];
      if (!assetData) return [];

      const { NETWORK_SETTINGS } = getConfig();
      const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
      const zapsDisabled =
        (!servicesEnabled.zaps && assetData.metadata.zapOutWith) || !currentNetworkSettings.zapsEnabled;
      const mainVaultTokenAddress = zapsDisabled ? assetData.token : assetData.metadata.defaultDisplayToken;
      const withdrawTokenAddresses = [mainVaultTokenAddress];
      if (!zapsDisabled) {
        if (assetData.token !== mainVaultTokenAddress) withdrawTokenAddresses.push(assetData.token);
        withdrawTokenAddresses.push(
          ...Object.values(tokensMap)
            .filter(({ address, supported }) => !withdrawTokenAddresses.includes(address) && supported.portalsZapOut)
            .map(({ address }) => address)
        );
      }

      const tokens = withdrawTokenAddresses
        .filter((address) => !!tokensMap[address])
        .map((address) => {
          const tokenData = tokensMap[address];
          const userTokenData = userTokensMap[address];
          const allowancesMap = userTokensAllowancesMap[address] ?? {};
          return createToken({ tokenData, userTokenData, allowancesMap });
        });
      return tokens.filter(
        (token) =>
          token.supported[assetData.metadata.zapOutWith as keyof TokenView['supported']] ||
          token.address === assetData.token ||
          token.address === assetData.metadata.defaultDisplayToken
      );
    })
);
