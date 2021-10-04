import { ReactNode } from 'react';
import styled from 'styled-components';

import { Card, CardHeader, CardContent, CardSizeType } from '@components/common';

const StyledCardContent = styled(CardContent)`
  margin: ${({ theme }) => theme.card.padding};
  font-size: 1.4rem;
  color: inherit;
`;

const StyledCard = styled(Card)`
  // max-width: max-content;
  padding: ${({ theme }) => theme.card.padding} 0;
  min-width: 28rem;
`;

interface InfoCardProps {
  header: string;
  content?: string;
  Component?: ReactNode;
  variant?: 'primary' | 'secondary';
  cardSize?: CardSizeType;
}

export const InfoCard = ({ header, content, Component, variant, cardSize, ...props }: InfoCardProps) => {
  return (
    <StyledCard variant={variant} cardSize={cardSize} {...props}>
      <CardHeader header={header} />
      <StyledCardContent>
        {content}
        {Component}
      </StyledCardContent>
    </StyledCard>
  );
};
