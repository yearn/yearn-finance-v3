import { FC } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { ChevronRightIcon, Icon } from '../../Icon';

const Arrow = styled(Icon)`
  height: 1.6rem;
  fill: currentColor;
`;

const StyledCardRedirection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  padding: 0 3.5rem;
  transition: color 200ms ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryVariant};
  }
`;

interface CardRedirectionProps {
  redirectTo: string;
  className?: string;
}

export const CardRedirection: FC<CardRedirectionProps> = ({ children, redirectTo, className, ...props }) => {
  const history = useHistory();

  return (
    <StyledCardRedirection className={className} {...props} onClick={() => history.push(`/${redirectTo}`)}>
      <Arrow Component={ChevronRightIcon} />
    </StyledCardRedirection>
  );
};
