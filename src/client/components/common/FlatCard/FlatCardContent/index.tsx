import { FC } from 'react';
import styled from 'styled-components';

import { ThreeColumnLayout } from '@containers/Columns';

const Container = styled(ThreeColumnLayout)<{ wrap?: string }>`
  flex-wrap: ${({ wrap }) => wrap};
`;

interface FlatCardContentProps {
  wrap?: boolean;
  onClick?: () => void;
}

export const FlatCardContent: FC<FlatCardContentProps> = ({ children, wrap, ...props }) => {
  return (
    <Container wrap={wrap ? 'wrap' : 'nowrap'} {...props}>
      {children}
    </Container>
  );
};
