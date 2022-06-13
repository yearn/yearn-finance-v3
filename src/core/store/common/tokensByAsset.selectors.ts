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
import { NetworkSelectors } from '../modules/network/network.selectors';

type SupportedTokenProps = {
  assetData: Vault | Lab;
  token: TokenView;
  zapType: 'zapInWith' | 'zapOutWith';
};

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

      const zapperDisabled =
        (!servicesEnabled.zapper && assetData.metadata.zapInWith === 'zapperZapIn') || currentNetwork !== 'mainnet';
      const mainVaultTokenAddress = zapperDisabled ? assetData.token : assetData.metadata.defaultDisplayToken;
      const depositTokenAddresses = [mainVaultTokenAddress];
      if (!zapperDisabled) {
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
        (token) => isZappable({ assetData, token, zapType: 'zapInWith' }) || token.address === mainVaultTokenAddress
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
        (token) =>
          isZappable({ assetData, token, zapType: 'zapOutWith' }) ||
          token.address === assetData.token ||
          token.address === assetData.metadata.defaultDisplayToken
      );
    })
);

const isZappable = ({ assetData, token, zapType }: SupportedTokenProps) => {
  if (zapType === 'zapInWith' && !toBN(token.balance).gt(0)) {
    return false;
  }

  const zap = assetData.metadata[zapType];

  // TODO Need to cast here because VaultMetadata is still coming as string from the SDK
  return token.supported[zap as keyof TokenView['supported']];
};
