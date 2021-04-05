import { FC } from 'react';
import styled from 'styled-components';
import { styledSystem, StyledSystemProps } from '../styledSystem';

export interface SpinnerLoadingProps extends StyledSystemProps {}

const StyledSpinnerLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  ${styledSystem}
`;

const StyledLoader = styled.div`
  &,
  &:before,
  &:after {
    background: #ffffff;
    -webkit-animation: loading 1s infinite ease-in-out;
    animation: loading 1s infinite ease-in-out;
    width: 1em;
    height: 4em;
  }
  & {
    color: #ffffff;
    text-indent: -9999em;
    position: relative;
    font-size: 1em;
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
  }
  &:before,
  &:after {
    position: absolute;
    top: 0;
    content: '';
  }
  &:before {
    left: -1.5em;
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
  }
  &:after {
    left: 1.5em;
  }
  @-webkit-keyframes loading {
    0%,
    80%,
    100% {
      box-shadow: 0 0;
      height: 4em;
    }
    40% {
      box-shadow: 0 -2em;
      height: 5em;
    }
  }
  @keyframes loading {
    0%,
    80%,
    100% {
      box-shadow: 0 0;
      height: 4em;
    }
    40% {
      box-shadow: 0 -2em;
      height: 5em;
    }
  }
`;

export const SpinnerLoading: FC<SpinnerLoadingProps> = ({ ...props }) => (
  <StyledSpinnerLoading {...props}>
    <StyledLoader />
  </StyledSpinnerLoading>
);
