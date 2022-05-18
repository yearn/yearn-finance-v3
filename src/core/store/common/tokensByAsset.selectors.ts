import { createSelector } from '@reduxjs/toolkit';
import { memoize } from 'lodash';

import { toBN } from '@utils';
import { getConfig } from '@config';
import { Lab, TokenView, Vault } from '@types';

import { VaultsSelectors } from '../modules/vaults/vaults.selectors';
import { LabsSelectors } from '../modules/labs/labs.selectors';
import { TokensSelectors } from '../modules/tokens/tokens.selectors';
import { AppSelectors } from '../modules/app/app.selectors';
import { createToken } from '../modules/tokens/tokens.selectors';

type SupportedTokenProps = {
  assetData: Vault | Lab;
  token: TokenView;
  mainVaultToken: string;
  zapperDisabled: boolean;
  zapType: 'zapInWith' | 'zapOutWith';
};

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
      const mainVaultToken = zapperDisabled ? assetData.token : assetData.metadata.defaultDisplayToken;
      const depositTokenAddresses = [mainVaultToken];
      if (!zapperDisabled) {
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
      return tokens.filter((token) =>
        isSupportedToken({ assetData, token, mainVaultToken, zapperDisabled, zapType: 'zapInWith' })
      );
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
      const mainVaultToken = zapperDisabled ? assetData.token : assetData.metadata.defaultDisplayToken;
      const withdrawTokenAddresses = [mainVaultToken];
      if (!zapperDisabled) {
        const { ZAP_OUT_TOKENS } = getConfig();
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
      return tokens.filter((token) =>
        isSupportedToken({ assetData, token, mainVaultToken, zapperDisabled, zapType: 'zapOutWith' })
      );
    })
);

const isSupportedToken = ({ assetData, token, mainVaultToken, zapperDisabled, zapType }: SupportedTokenProps) => {
  if (!zapperDisabled && token.address !== mainVaultToken) {
    const zap = assetData.metadata[zapType];

    // TODO Need to cast here because VaultMetadata is still coming as string from the SDK
    return token.supported[zap as keyof TokenView['supported']] && toBN(token.balance).gt(0);
  }

  return toBN(token.balance).gt(0) || token.address === mainVaultToken;
};
