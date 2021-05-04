import { ReactNode } from 'react';
import styled from 'styled-components';

import { Card, CardHeader, CardContent, CardElement } from '@components/common';

const StyledCard = styled(Card)`
  max-width: max-content;
  padding: 1.2rem;
`;

interface Item {
  header: string;
  content?: string;
  Component?: ReactNode;
}

interface SummaryCardProps {
  header: string;
  items: Item[];
}

export const SummaryCard = ({ header, items }: SummaryCardProps) => {
  return (
    <StyledCard>
      <CardHeader header={header} />
      <CardContent>
        {items.map((item) => (
          <CardElement key={item.header} header={item.header} content={item.content}>
            {item.Component}
          </CardElement>
        ))}
      </CardContent>
    </StyledCard>
  );
};
