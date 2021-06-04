import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import { Card, CardHeader, CardContent, CardElement, Text } from '@components/common';

const StyledCard = styled(Card)`
  padding: 1.2rem 0;
  flex: 1;
  width: 100%;
`;

const StyledCardContent = styled(CardContent)`
  column-gap: 10.9rem;
`;
const StyledCardElement = styled(CardElement)`
  max-width: 100%;
  overflow: hidden;
`;

const StyledText = styled(Text)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurfaceH1Contrast};
`;

interface Item {
  header: string;
  content?: string;
  Component?: ReactNode;
}

interface SummaryCardProps {
  header?: string;
  items: Item[];
  variant?: 'primary' | 'secondary';
  cardSize?: 'small' | 'big';
}

export const SummaryCard: FC<SummaryCardProps> = ({ header, items, variant, cardSize, ...props }) => {
  return (
    <StyledCard variant={variant} cardSize={cardSize} {...props}>
      {header && <CardHeader header={header} />}

      <StyledCardContent wrap>
        {items.map((item) => (
          <StyledCardElement
            key={item.header}
            header={item.header}
            content={<StyledText>{item.content}</StyledText>}
          ></StyledCardElement>
        ))}
      </StyledCardContent>
    </StyledCard>
  );
};
