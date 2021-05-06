import { FC } from 'react';
import styled from 'styled-components';

import LogoSimple from '@assets/images/yearn-logo.svg';
import LogoFull from '@assets/images/yearn-logo-full.svg';

export interface LogoProps {
  className?: string;
  full?: boolean;
  onClick?: () => void;
}

const StyledLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
  height: 4.8rem;
`;

const StyledImg = styled.img`
  height: 100%;
`;

export const Logo: FC<LogoProps> = ({ className, full, onClick, ...props }) => {
  const logoSvg = full ? LogoFull : LogoSimple;

  return (
    <StyledLogo className={className} onClick={onClick} {...props}>
      <StyledImg src={logoSvg} alt="Yearn logo" />
    </StyledLogo>
  );
};
