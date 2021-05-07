import { FC } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  margin: 0 1.2rem;
`;

const Header = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
`;

interface CardElementProps {
  header?: string;
}

export const CardHeader: FC<CardElementProps> = ({ children, header }) => {
  return (
    <Container>
      {header && <Header>{header}</Header>}
      {children}
    </Container>
  );
};
