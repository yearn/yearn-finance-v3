import { keyBy } from 'lodash';

import { getConfig } from '@config';
import { useAppSelector } from '@src/client/hooks';
import { TokensSelectors } from '@src/core/store';
import { GeneralLabView, GeneralVaultView, TokenView } from '@src/core/types';
import { createPlaceholderToken } from '@src/utils';

interface SelectedSellTokenProps {
  selectedSellTokenAddress?: string;
  selectedVaultOrLab?: GeneralVaultView | GeneralLabView;
  allowTokenSelect?: boolean;
}

interface SelectedSellToken {
  selectedSellToken?: TokenView;
  sourceAssetOptions: TokenView[];
}

export const useSelectedSellToken = ({
  selectedSellTokenAddress,
  selectedVaultOrLab,
  allowTokenSelect,
}: SelectedSellTokenProps): SelectedSellToken => {
  const { ETHEREUM_ADDRESS } = getConfig();
  const selectedTokenMap = useAppSelector(TokensSelectors.selectTokensMap);
  let userTokens = useAppSelector(TokensSelectors.selectZapInTokens);
  userTokens = selectedVaultOrLab?.allowZapIn ? userTokens : [];

  if (!selectedSellTokenAddress) return { selectedSellToken: undefined, sourceAssetOptions: [] };

  const sellTokensOptions = selectedVaultOrLab
    ? [selectedVaultOrLab.token, ...userTokens.filter(({ address }) => address !== selectedVaultOrLab.token.address)]
    : userTokens;
  const sellTokensOptionsMap = keyBy(sellTokensOptions, 'address');
  let selectedSellToken: TokenView | undefined = sellTokensOptionsMap[selectedSellTokenAddress];
  const addressIsNativeCurrency = selectedSellTokenAddress === ETHEREUM_ADDRESS;

  if (!selectedSellToken && addressIsNativeCurrency) {
    const tokenData = selectedTokenMap[ETHEREUM_ADDRESS];
    selectedSellToken = createPlaceholderToken(tokenData);
  }

  const sourceAssetOptions = selectedSellToken && allowTokenSelect === false ? [selectedSellToken] : sellTokensOptions;
  return { selectedSellToken, sourceAssetOptions };
};
