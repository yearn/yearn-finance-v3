import { useAppDispatch, useAppTranslation } from '@hooks';
import { Box } from '@components/common';
import { initiateSaveVaults, getTokens } from '@store';

export const Landing = () => {
  const dispatch = useAppDispatch();
  const { t } = useAppTranslation('common');
  function getVaults() {
    dispatch(initiateSaveVaults());
  }
  function initTokens() {
    dispatch(getTokens());
  }
  return (
    <Box center flex={1}>
      {t('title')}
      <button onClick={getVaults}>init vaults</button>
      <button onClick={initTokens}>get tokens</button>
    </Box>
  );
};
