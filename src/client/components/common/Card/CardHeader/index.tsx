import { FC } from 'react';
import styled from 'styled-components/macro';

const Container = styled.div`
  width: 100%;
  padding: 0 ${({ theme }) => theme.card.padding};
  margin-bottom: 1.2rem;
`;

const BigHeader = styled.h1`
  font-size: 2.4rem;
  font-weight: 700;
  margin: 0;
  padding: 0;
`;

const Header = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  padding: 0;
`;

const SubHeader = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  padding: 0;
`;

interface CardElementProps {
  bigHeader?: string;
  header?: string;
  subHeader?: string;
}

export const CardHeader: FC<CardElementProps> = ({ children, bigHeader, header, subHeader, ...props }) => {
  return (
    <Container {...props}>
      {bigHeader && <BigHeader>{bigHeader}</BigHeader>}
      {header && <Header>{header}</Header>}
      {subHeader && <SubHeader>{subHeader}</SubHeader>}
      {children}
    </Container>
  );
};
