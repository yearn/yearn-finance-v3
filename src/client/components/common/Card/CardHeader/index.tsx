import { FC } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  padding: 0 ${({ theme }) => theme.cardPadding};
`;

const Header = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
`;

interface CardElementProps {
  header?: string;
}

export const CardHeader: FC<CardElementProps> = ({ children, header, ...props }) => {
  return (
    <Container {...props}>
      {header && <Header>{header}</Header>}
      {children}
    </Container>
  );
};
