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

const ArrowIcon = styled(Icon)`
  fill: currentColor;
  width: 1rem;
`;

const ArrowButton = styled(Button)`
  fill: red;
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

const StyledCard = styled(Card)`
  // max-width: max-content;
  padding: ${({ theme }) => theme.card.padding} 0;
  background: ${({ theme }) => theme.colors.backgroundVariant};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  min-width: 28rem;
  position: relative;
`;

interface SlideContent {
  header: any;
  content: any;
  background?: string;
}

interface SliderCardProps {
  header?: string;
  content?: string;
  Component?: ReactNode;
  variant?: 'primary' | 'secondary';
  cardSize?: CardSizeType;
  slidesContent?: SlideContent[];
}

export const SliderCard = ({
  header,
  content,
  Component,
  variant,
  cardSize,
  slidesContent,
  ...props
}: SliderCardProps) => {
  const [selectedSlide, setSelectedSlide] = useState(0);

  const textHeader = !!slidesContent?.length ? slidesContent[selectedSlide]?.header : header;
  const extraContent = !!slidesContent?.length ? slidesContent[selectedSlide].content : Component;

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
      <CardHeader bigHeader={textHeader} />
      <StyledCardContent>
        {content}
        {extraContent}
      </StyledCardContent>

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
