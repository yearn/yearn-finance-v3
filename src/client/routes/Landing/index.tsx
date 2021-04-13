import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { Button } from '@components/common';
import { device } from '@themes/default';
import useWindowDimensions from '@hooks/windowDimensions';

import { YearnSplash } from '@assets/images';
import YearnSplashVideo from '@assets/videos/yearn-splash-video.webm';

const LandingView = styled.div`
  display: flex;
  position: relative;
  flex: 1;
`;

const VideoWrapper = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: -1;
  background-image: url(${YearnSplash});
  background-size: cover;
  background-position: center;
`;

const StyledVideo = styled.video`
  position: relative;
  object-fit: cover;
  width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const SplashContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  position: relative;
  width: 100%;

  h1,
  h3,
  span {
    text-align: center;
  }

  span {
    text-align: center;
    width: 41rem;
    line-height: 3.1rem;
    margin-top: 1.7rem;
    margin-bottom: 4rem;
    max-width: 100%;
  }

  @media ${device.tablet} {
    h3 {
      display: flex;
      align-items: flex-end;
      font-size: 1.6rem;
      flex: 1;
    }
    h1 {
      font-size: 4.1rem;
      margin-top: 1.3rem;
    }
    span {
      font-size: 1.4rem;
      line-height: 2.6rem;
      flex: 1;
      padding: 0 2rem;
      margin-bottom: 3rem;
    }
    .action-button {
      margin-bottom: 7rem;
    }
  }
`;

const StyledButton = styled(Button)`
  min-width: 16rem;
`;

export const Landing = () => {
  const { t } = useAppTranslation('common');
  const { isMobile } = useWindowDimensions();

  let video;

  if (!isMobile) {
    video = <StyledVideo src={YearnSplashVideo} autoPlay loop playsInline muted />;
  }

  return (
    <LandingView>
      <VideoWrapper>{video}</VideoWrapper>
      <SplashContent>
        <h3>{t('landing.title-1')}</h3>
        <h1>{t('landing.title-2')}</h1>
        <span className="t-subtitle">{t('landing.subtitle')}</span>
        <Link className="action-button" to="/Save">
          <StyledButton>{t('landing.action-button')}</StyledButton>
        </Link>
      </SplashContent>
    </LandingView>
  );
};
