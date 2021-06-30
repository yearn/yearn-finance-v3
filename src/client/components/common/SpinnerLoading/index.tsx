import { FC } from 'react';
import styled from 'styled-components';
import { styledSystem, StyledSystemProps } from '../styledSystem';

export interface SpinnerLoadingProps extends StyledSystemProps {}

const StyledSpinnerLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  gap: 0.5em;
  position: relative;

  ${styledSystem}
`;

const StyledLoader = styled.div`
  animation: dots-loading 1s infinite ease-in-out alternate;
  animation-delay: 0.5s;

  background-color: currentColor;
  border-radius: 1em;
  display: inline-block;
  height: 1em;
  width: 1em;
  box-sizing: border-box;
  opacity: 0.4;
  transform: scale(0.8, 0.8);

  &:first-child {
    animation-delay: 0s;
  }

  &:last-child {
    animation-delay: 1s;
  }

  @keyframes dots-loading {
    0% {
      opacity: 0.4;
      transform: scale(0.8, 0.8);
    }

    50%,
    100% {
      opacity: 1;
      transform: scale(1, 1);
    }
  }
`;

export const SpinnerLoading: FC<SpinnerLoadingProps> = ({ ...props }) => (
  <StyledSpinnerLoading {...props}>
    <StyledLoader />
    <StyledLoader />
    <StyledLoader />
  </StyledSpinnerLoading>
);
