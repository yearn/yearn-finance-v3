import { ReactNode, useState } from 'react';
import styled from 'styled-components';

import {
  Card,
  CardHeader,
  CardContent,
  CardSizeType,
  Button,
  Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@components/common';
import { device } from '@themes/default';

const ArrowIcon = styled(Icon)`
  fill: currentColor;
  width: 1rem;
`;

const ArrowButton = styled(Button)`
  padding: 0.7rem;
`;

const SliderCounter = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  bottom: ${({ theme }) => theme.layoutPadding};
  right: ${({ theme }) => theme.layoutPadding};
  font-weight: 700;
  font-size: 1.6rem;

  ${ArrowButton}:not(:first-child) {
    margin-left: 0.8rem;
  }
  ${ArrowButton}:not(:last-child) {
    margin-right: 0.8rem;
  }
`;

const StyledCardContent = styled(CardContent)`
  margin: ${({ theme }) => theme.card.padding};
  margin-bottom: 0;
  font-size: 1.6rem;
  line-height: 2.4rem;
  color: inherit;
`;

const CardBackground = styled.div`
  display: flex;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.globalRadius};
  margin: -2px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
`;

const CardWrapper = styled.article`
  padding: ${({ theme }) => theme.card.padding} 0;
  min-width: 50%;
`;

const StyledCard = styled(Card)`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 0;
  background: ${({ theme }) => theme.colors.backgroundVariant};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  min-width: 28rem;
  position: relative;

  @media ${device.mobile} {
    flex-direction: column;

    ${CardBackground} {
      order: -1;
    }
  }
`;

interface SlideContent {
  header: string;
  content: ReactNode | string;
}

interface SliderCardProps {
  header?: string;
  content?: string;
  Component?: ReactNode;
  variant?: 'primary' | 'secondary';
  cardSize?: CardSizeType;
  slidesContent?: SlideContent[];
  background?: string;
}

export const SliderCard = ({
  header,
  content,
  Component,
  variant,
  cardSize,
  slidesContent,
  background,
  ...props
}: SliderCardProps) => {
  const [selectedSlide, setSelectedSlide] = useState(0);

  const textHeader = slidesContent?.length ? slidesContent[selectedSlide]?.header : header;
  const extraContent = slidesContent?.length ? slidesContent[selectedSlide]?.content : Component;

  const previousSlide = () => {
    if (!slidesContent?.length) return;
    const newSlide = selectedSlide <= 0 ? slidesContent.length - 1 : selectedSlide - 1;
    setSelectedSlide(newSlide);
  };

  const nextSlide = () => {
    if (!slidesContent?.length) return;
    const newSlide = selectedSlide >= slidesContent.length - 1 ? 0 : selectedSlide + 1;
    setSelectedSlide(newSlide);
  };

  return (
    <StyledCard variant={variant} cardSize={cardSize} {...props}>
      <CardWrapper>
        <CardHeader bigHeader={textHeader} />
        <StyledCardContent>
          {content}
          {extraContent}
        </StyledCardContent>
      </CardWrapper>

      {background && (
        <CardBackground>
          <img src={background} alt="Amsterdam banner" />
        </CardBackground>
      )}

      {!!slidesContent?.length && (
        <SliderCounter>
          <ArrowButton onClick={previousSlide}>
            <ArrowIcon Component={ChevronLeftIcon} />
          </ArrowButton>
          {selectedSlide + 1}/{slidesContent.length}
          <ArrowButton onClick={nextSlide}>
            <ArrowIcon Component={ChevronRightIcon} />
          </ArrowButton>
        </SliderCounter>
      )}
    </StyledCard>
  );
};
