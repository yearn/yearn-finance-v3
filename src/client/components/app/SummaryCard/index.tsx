import { ReactNode } from 'react';
import styled from 'styled-components';

import { Card, CardHeader, CardContent, CardElement } from '@components/common';

const StyledCard = styled(Card)`
  max-width: max-content;
  padding: 1.2rem 0;
  margin-bottom: 1.6rem;
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
}

export const SummaryCard = ({ header, items, variant }: SummaryCardProps) => {
  return (
    <StyledCard variant={variant}>
      {header && <CardHeader header={header} />}
      <CardContent wrap>
        {items.map((item) => (
          <CardElement key={item.header} header={item.header} content={item.content}>
            {item.Component}
          </CardElement>
        ))}
      </CardContent>
    </StyledCard>
  );
};
