import { ReactNode } from 'react';
import styled from 'styled-components';

import { Card, CardHeader, CardContent, CardElement } from '@components/common';

const StyledCard = styled(Card)`
  max-width: max-content;
  padding: 1.2rem 0;
`;

interface InfoCardProps {
  header: string;
  content?: string;
  Component?: ReactNode;
  variant?: 'primary' | 'secondary';
}

export const InfoCard = ({ header, content, Component, variant, ...props }: InfoCardProps) => {
  return (
    <StyledCard variant={variant} {...props}>
      <CardHeader header={header} />
      <CardContent>
        <CardElement content={content} width="36.5rem">
          {Component}
        </CardElement>
      </CardContent>
    </StyledCard>
  );
};
