import { createSelector } from '@reduxjs/toolkit';
import { memoize } from 'lodash';

import { toBN } from '@utils';
import { getConfig } from '@config';
import { TokenView, Address } from '@types';

import { VaultsSelectors } from '../modules/vaults/vaults.selectors';
import { TokensSelectors } from '../modules/tokens/tokens.selectors';
import { AppSelectors } from '../modules/app/app.selectors';
import { createToken } from '../modules/tokens/tokens.selectors';

const { selectVaultsMap } = VaultsSelectors;
const { selectTokensMap, selectTokensUser } = TokensSelectors;
const { selectServicesEnabled } = AppSelectors;

export const selectDepositTokenOptionsByVault = createSelector(
  [selectVaultsMap, selectTokensMap, selectTokensUser, selectServicesEnabled],
  (vaultsMap, tokensMap, tokensUser, servicesEnabled) =>
    memoize((vaultAddress?: string): TokenView[] => {
      if (!vaultAddress) return [];

      const { userTokensAddresses, userTokensMap, userTokensAllowancesMap } = tokensUser;
      const vaultData = vaultsMap[vaultAddress];
      if (!vaultData) return [];

      const zapperDisabled = !servicesEnabled.zapper; // TODO: add vaultData.metadata.zapInWith === 'zapperZapIn' when sdk updates
      console.log(zapperDisabled, vaultData, servicesEnabled);
      const depositTokenAddresses: Address[] = [];
      let mainVaultToken: Address;
      if (zapperDisabled) {
        mainVaultToken = vaultData.token;
        depositTokenAddresses.push(mainVaultToken);
      } else {
        mainVaultToken = vaultData.metadata.defaultDisplayToken;
        depositTokenAddresses.push(mainVaultToken);
        depositTokenAddresses.push(...userTokensAddresses.filter((address) => address !== mainVaultToken));
      }

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

export const selectWithdrawTokenOptionsByVault = createSelector(
  [selectVaultsMap, selectTokensMap, selectTokensUser, selectServicesEnabled],
  (vaultsMap, tokensMap, tokensUser, servicesEnabled) =>
    memoize((vaultAddress?: string): TokenView[] => {
      if (!vaultAddress) return [];

      const { ZAP_OUT_TOKENS } = getConfig();
      const { userTokensMap, userTokensAllowancesMap } = tokensUser;
      const vaultData = vaultsMap[vaultAddress];
      if (!vaultData) return [];

      const zapperDisabled = !servicesEnabled.zapper; // TODO: add vaultData.metadata.zapOutWith === 'zapperZapOut' when sdk updates
      console.log(zapperDisabled, vaultData, servicesEnabled);
      const withdrawTokenAddresses: Address[] = [];
      let mainVaultToken: Address;
      if (zapperDisabled) {
        mainVaultToken = vaultData.token;
        withdrawTokenAddresses.push(mainVaultToken);
      } else {
        mainVaultToken = vaultData.metadata.defaultDisplayToken;
        withdrawTokenAddresses.push(mainVaultToken);
        withdrawTokenAddresses.push(...ZAP_OUT_TOKENS.filter((address) => address !== mainVaultToken));
      }

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
