import { FC } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

// NOTE: App errors out when trying to import directly from 'common'
import { ChevronRightIcon, Icon } from '@components/common/Icon';

const Arrow = styled(Icon)`
  height: 1.6rem;
  fill: currentColor;
`;

const StyledCardRedirection = styled.div`
  display: flex;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
  padding: ${({ theme }) => theme.card.padding};
  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
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
