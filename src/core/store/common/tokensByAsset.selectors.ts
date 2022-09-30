import { createSelector } from '@reduxjs/toolkit';
import { memoize } from 'lodash';

import { toBN } from '@utils';
import { getConfig } from '@config';
import { TokenView, Vault } from '@types';

import { VaultsSelectors } from '../modules/vaults/vaults.selectors';
import { TokensSelectors } from '../modules/tokens/tokens.selectors';
import { AppSelectors } from '../modules/app/app.selectors';
import { createToken } from '../modules/tokens/tokens.selectors';
import { NetworkSelectors } from '../modules/network/network.selectors';

type SupportedTokenProps = {
  assetData: Vault;
  token: TokenView;
  zapType: 'zapInWith' | 'zapOutWith';
};

const { selectVaultsMap } = VaultsSelectors;
const { selectTokensMap, selectTokensUser } = TokensSelectors;
const { selectServicesEnabled } = AppSelectors;
const { selectCurrentNetwork } = NetworkSelectors;

export const selectDepositTokenOptionsByAsset = createSelector(
  [selectVaultsMap, selectTokensMap, selectTokensUser, selectServicesEnabled, selectCurrentNetwork],
  (vaultsMap, tokensMap, tokensUser, servicesEnabled, currentNetwork) =>
    memoize((assetAddress?: string): TokenView[] => {
      const { TOKEN_ADDRESSES } = getConfig();
      const { userTokensMap, userTokensAllowancesMap } = tokensUser;

      const tokens = Object.values(TOKEN_ADDRESSES)
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

export const selectWithdrawTokenOptionsByAsset = createSelector(
  [selectVaultsMap, selectTokensMap, selectTokensUser, selectServicesEnabled, selectCurrentNetwork],
  (vaultsMap, tokensMap, tokensUser, servicesEnabled, currentNetwork) =>
    memoize((assetAddress?: string): TokenView[] => {
      if (!assetAddress) return [];

      const { userTokensMap, userTokensAllowancesMap } = tokensUser;
      const assetData = vaultsMap[assetAddress] ? vaultsMap[assetAddress] : null;
      if (!assetData) return [];

      const zapperDisabled =
        (!servicesEnabled.zapper && assetData.metadata.zapOutWith === 'zapperZapOut') || currentNetwork !== 'mainnet';
      const mainVaultTokenAddress = zapperDisabled ? assetData.token : assetData.metadata.defaultDisplayToken;
      const withdrawTokenAddresses = [mainVaultTokenAddress];
      if (!zapperDisabled) {
        const { ZAP_OUT_TOKENS } = getConfig();
        if (assetData.token !== mainVaultTokenAddress) withdrawTokenAddresses.push(assetData.token);
        withdrawTokenAddresses.push(...ZAP_OUT_TOKENS.filter((address) => !withdrawTokenAddresses.includes(address)));
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
        (token) => token.address === assetData.token || token.address === assetData.metadata.defaultDisplayToken
      );
    })
);
