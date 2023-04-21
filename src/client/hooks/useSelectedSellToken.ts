import { useAppSelector } from '@hooks';
import { selectDepositTokenOptionsByAsset, TokensSelectors } from '@store';
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
  const tokenSelectorFilter = useAppSelector(TokensSelectors.selectToken);
  const depositTokenOptionsByAsset = useAppSelector(selectDepositTokenOptionsByAsset);
  const sellTokensOptions = depositTokenOptionsByAsset(selectedVaultOrLab?.address);
  let selectedSellToken: TokenView | undefined = selectedSellTokenAddress
    ? tokenSelectorFilter(selectedSellTokenAddress ?? '')
    : undefined;

  const sourceAssetOptions = selectedSellToken && allowTokenSelect === false ? [selectedSellToken] : sellTokensOptions;
  return { selectedSellToken, sourceAssetOptions };
};
