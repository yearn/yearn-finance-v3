import { FC } from 'react';
import styled from 'styled-components';

const Container = styled.div<{ wrap?: string }>`
  display: flex;
  flex-direction: row;
  flex-wrap: ${({ wrap }) => wrap};
  align-items: center;
`;

interface CardContentProps {
  wrap?: boolean;
  onClick?: () => void;
}

export const CardContent: FC<CardContentProps> = ({ children, wrap, ...props }) => {
  return (
    <Container wrap={wrap ? 'wrap' : 'nowrap'} {...props}>
      {children}
    </Container>
  );
};
