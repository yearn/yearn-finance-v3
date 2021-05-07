import { FC } from 'react';
import styled from 'styled-components';

const Container = styled.div<{ width?: string; align?: string; grow?: string }>`
  display: flex;
  flex-direction: column;
  min-width: ${({ width }) => width ?? '14rem'};
  align-items: ${({ align }) => align ?? 'flex-start'};
  flex-grow: ${({ grow }) => grow ?? '0'};
  margin: 0.825rem 1.2rem;
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
  width?: string;
  align?: 'flex-start' | 'center' | 'flex-end';
  grow?: '1' | '0';
}

export const CardElement: FC<CardElementProps> = ({ children, header, content, width, align, grow }) => {
  return (
    <Container width={width} align={align} grow={grow}>
      {header && <Header>{header}</Header>}
      {content && <Content>{content}</Content>}
      {children}
    </Container>
  );
};
