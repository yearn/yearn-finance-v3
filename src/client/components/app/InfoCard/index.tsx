import { ReactNode } from 'react';
import styled from 'styled-components';

import { Card, CardHeader, CardContent, CardElement } from '@components/common';

const StyledCard = styled(Card)`
  max-width: max-content;
  padding: 1.2rem 0;
  margin-bottom: 1.6rem;
`;

interface InfoCardProps {
  header: string;
  content?: string;
  Component?: ReactNode;
  variant?: 'primary' | 'surface';
}

export const InfoCard = ({ header, content, Component, variant }: InfoCardProps) => {
  return (
    <StyledCard variant={variant}>
      <CardHeader header={header} />
      <CardContent>
        <CardElement content={content} width="36.5rem">
          {Component}
        </CardElement>
      </CardContent>
    </StyledCard>
  );
};
