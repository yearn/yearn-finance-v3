import { FC } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  padding: 0 ${({ theme }) => theme.cardPadding};
`;

const Header = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
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
  header?: string;
  subHeader?: string;
}

export const CardHeader: FC<CardElementProps> = ({ children, header, subHeader, ...props }) => {
  return (
    <Container {...props}>
      {header && <Header>{header}</Header>}
      {subHeader && <SubHeader>{subHeader}</SubHeader>}
      {children}
    </Container>
  );
};
