import { useAppTranslation } from '@hooks';
import { Box } from '@components/common';

export const Home = () => {
  const { t } = useAppTranslation('common');
  return (
    <Box center flex={1}>
      {t('title')}
    </Box>
  );
};
