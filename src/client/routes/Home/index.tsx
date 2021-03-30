import { useAppDispatch, useAppTranslation } from '@hooks';
import { Box } from '@components/common';
import { initiateSaveVaults } from '@store';

export const Home = () => {
  const dispatch = useAppDispatch();
  const { t } = useAppTranslation('common');
  function getVaults() {
    dispatch(initiateSaveVaults());
  }
  return (
    <Box center flex={1}>
      {t('title')}
      <button onClick={getVaults}>init vaults</button>
    </Box>
  );
};
