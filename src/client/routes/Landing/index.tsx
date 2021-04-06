import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { Box, Button, Text } from '@components/common';

import { YearnSplash } from '@assets/images';
import YearnSplashVideo from '@assets/videos/yearn-splash-video.mp4';

const LandingView = styled.div`
  display: flex;
  position: relative;
  flex: 1;
`;

const StyledVideo = styled.video`
  object-fit: cover;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-image: url(${YearnSplash});
  background-size: cover;
  background-position: center;
`;

const SplashContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  position: relative;
`;

export const Landing = () => {
  const { t } = useAppTranslation('common');

  return (
    <LandingView>
      <StyledVideo src={YearnSplashVideo} autoPlay loop playsInline muted />
      <SplashContent>
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
      </SplashContent>
    </LandingView>
  );
};
