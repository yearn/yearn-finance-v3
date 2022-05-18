import { createSelector } from '@reduxjs/toolkit';
import { memoize } from 'lodash';

import { toBN } from '@utils';
import { getConfig } from '@config';
import { TokenView, Address } from '@types';

import { VaultsSelectors } from '../modules/vaults/vaults.selectors';
import { LabsSelectors } from '../modules/labs/labs.selectors';
import { TokensSelectors } from '../modules/tokens/tokens.selectors';
import { AppSelectors } from '../modules/app/app.selectors';
import { createToken } from '../modules/tokens/tokens.selectors';

const { selectVaultsMap } = VaultsSelectors;
const { selectLabsMap } = LabsSelectors;
const { selectTokensMap, selectTokensUser } = TokensSelectors;
const { selectServicesEnabled } = AppSelectors;

export const selectDepositTokenOptionsByAsset = createSelector(
  [selectVaultsMap, selectLabsMap, selectTokensMap, selectTokensUser, selectServicesEnabled],
  (vaultsMap, labsMap, tokensMap, tokensUser, servicesEnabled) =>
    memoize((assetAddress?: string): TokenView[] => {
      if (!assetAddress) return [];

      const { userTokensAddresses, userTokensMap, userTokensAllowancesMap } = tokensUser;
      const assetData = vaultsMap[assetAddress] ? vaultsMap[assetAddress] : labsMap[assetAddress];
      if (!assetData) return [];

      const zapperDisabled = !servicesEnabled.zapper && assetData.metadata.zapInWith === 'zapperZapIn';
      const depositTokenAddresses: Address[] = [];
      let mainVaultToken: Address;
      if (zapperDisabled) {
        mainVaultToken = assetData.token;
      } else {
        mainVaultToken = assetData.metadata.defaultDisplayToken;
        depositTokenAddresses.push(...userTokensAddresses.filter((address) => address !== mainVaultToken));
      }
      depositTokenAddresses.unshift(mainVaultToken);

      const tokens = depositTokenAddresses
        .filter((address) => !!tokensMap[address])
        .map((address) => {
          const tokenData = tokensMap[address];
          const userTokenData = userTokensMap[address];
          const allowancesMap = userTokensAllowancesMap[address] ?? {};
          return createToken({ tokenData, userTokenData, allowancesMap });
        });
      return tokens.filter((token) => toBN(token.balance).gt(0) || token.address === mainVaultToken);
    })
);

export const selectWithdrawTokenOptionsByAsset = createSelector(
  [selectVaultsMap, selectLabsMap, selectTokensMap, selectTokensUser, selectServicesEnabled],
  (vaultsMap, labsMap, tokensMap, tokensUser, servicesEnabled) =>
    memoize((assetAddress?: string): TokenView[] => {
      if (!assetAddress) return [];

      const { userTokensMap, userTokensAllowancesMap } = tokensUser;
      const assetData = vaultsMap[assetAddress] ? vaultsMap[assetAddress] : labsMap[assetAddress];
      if (!assetData) return [];

      const zapperDisabled = !servicesEnabled.zapper && assetData.metadata.zapOutWith === 'zapperZapOut';
      const withdrawTokenAddresses: Address[] = [];
      let mainVaultToken: Address;
      if (zapperDisabled) {
        mainVaultToken = assetData.token;
      } else {
        const { ZAP_OUT_TOKENS } = getConfig();
        mainVaultToken = assetData.metadata.defaultDisplayToken;
        withdrawTokenAddresses.push(...ZAP_OUT_TOKENS.filter((address) => address !== mainVaultToken));
      }
      withdrawTokenAddresses.unshift(mainVaultToken);

      const tokens = withdrawTokenAddresses
        .filter((address) => !!tokensMap[address])
        .map((address) => {
          const tokenData = tokensMap[address];
          const userTokenData = userTokensMap[address];
          const allowancesMap = userTokensAllowancesMap[address] ?? {};
          return createToken({ tokenData, userTokenData, allowancesMap });
        });
      return tokens;
    })
);
