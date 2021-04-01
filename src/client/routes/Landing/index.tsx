import { Link } from 'react-router-dom';
import { useAppTranslation } from '@hooks';

import { Box, Button } from '@components/common';

export const Landing = () => {
  const { t } = useAppTranslation('common');

  return (
    <Box center flex={1}>
      {t('title')}
      <Button>
        <Link to="/Save">Go to save</Link>
      </Button>
    </Box>
  );
};
