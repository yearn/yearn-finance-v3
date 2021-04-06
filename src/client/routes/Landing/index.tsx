import { Link } from 'react-router-dom';

import { useAppTranslation } from '@hooks';
import { Box, Button, Text } from '@components/common';
import { YearnSplash } from '@assets/images';

export const Landing = () => {
  const { t } = useAppTranslation('common');

  return (
    <Box center flex={1} backgroundImage={`url(${YearnSplash})`} backgroundSize="cover" backgroundPosition="center">
      <Text fontSize={26} mt={80} textAlign="center">
        THE
      </Text>
      <Text fontSize={117} textAlign="center">
        {t('title')}
      </Text>
      <Text fontSize={18} mt={17} mb={40} width={418} lineHeight="31px" textAlign="center">
        {t('subtitle')}
      </Text>
      <Button>
        <Link to="/Save">Go to App</Link>
      </Button>
    </Box>
  );
};
