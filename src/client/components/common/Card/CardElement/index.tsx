import { FC } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 24rem;
  margin-top: 0.825rem;
`;

const Header = styled.div`
  font-size: 1.4rem;
`;

const Content = styled.div`
  margin-top: 0.5rem;
  font-size: 2.4rem;
`;

interface CardElementProps {
  header?: string;
  content?: string;
}

export const CardElement: FC<CardElementProps> = ({ children, header, content }) => {
  return (
    <Container>
      {header && <Header>{header}</Header>}
      {content && <Content>{content}</Content>}
      {children}
    </Container>
  );
};
