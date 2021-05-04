import { FC } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

export const CardContent: FC = ({ children }) => {
  return <Container>{children}</Container>;
};
