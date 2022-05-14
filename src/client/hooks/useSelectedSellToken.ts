import { keyBy } from 'lodash';

import { useAppSelector } from '@hooks';
import { selectDepositTokenOptionsByAsset } from '@store';
import { GeneralLabView, GeneralVaultView, TokenView } from '@types';

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
  const depositTokenOptionsByAsset = useAppSelector(selectDepositTokenOptionsByAsset);
  const sellTokensOptions = depositTokenOptionsByAsset(selectedVaultOrLab?.address);

  if (!selectedSellTokenAddress) return { selectedSellToken: undefined, sourceAssetOptions: [] };

  const sellTokensOptionsMap = keyBy(sellTokensOptions, 'address');
  let selectedSellToken: TokenView | undefined = sellTokensOptionsMap[selectedSellTokenAddress];

  const sourceAssetOptions = selectedSellToken && allowTokenSelect === false ? [selectedSellToken] : sellTokensOptions;
  return { selectedSellToken, sourceAssetOptions };
};
