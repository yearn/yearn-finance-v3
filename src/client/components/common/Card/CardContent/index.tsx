import { FC } from 'react';
import styled from 'styled-components';

const Container = styled.div<{ wrap?: boolean }>`
  display: flex;
  flex-direction: row;
  flex-wrap: ${({ wrap }) => (wrap ? 'wrap' : 'nowrap')};
  align-items: center;
`;

interface CardContentProps {
  wrap?: boolean;
}

export const CardContent: FC<CardContentProps> = ({ children, wrap }) => {
  return <Container wrap={wrap}>{children}</Container>;
};
