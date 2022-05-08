import { ReactNode, useState } from 'react';
import styled from 'styled-components';

import { Card, CardHeader, CardContent, CardSizeType } from '@components/common';

const StyledCardContent = styled(CardContent)`
  margin: ${({ theme }) => theme.card.padding};
  margin-bottom: 0;
  font-size: 1.6rem;
  line-height: 2.4rem;
  color: inherit;
`;

const StyledCard = styled(Card)`
  padding: ${({ theme }) => theme.card.padding} 0;
  background: ${({ theme }) => theme.colors.surface};
  //border: 2px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.texts};
  min-width: 28rem;
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

export const TextCard = ({
  header,
  content,
  Component,
  variant,
  cardSize,
  slidesContent,
  ...props
}: SliderCardProps) => {
  const [selectedSlide] = useState(0);

  const textHeader = !!slidesContent?.length ? slidesContent[selectedSlide]?.header : header;
  const extraContent = !!slidesContent?.length ? slidesContent[selectedSlide].content : Component;

  return (
    <StyledCard variant={variant} cardSize={cardSize} {...props}>
      <CardHeader bigHeader={textHeader} />
      <StyledCardContent>
        {content}
        {extraContent}
      </StyledCardContent>
    </StyledCard>
  );
};
