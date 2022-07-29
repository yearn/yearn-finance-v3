import { FC } from 'react';
import styled from 'styled-components';

import { ReactComponent as LogoSimple } from '@assets/images/debt-dao-logo.svg';
import { ReactComponent as LogoFull } from '@assets/images/debt-dao-logo-full.svg';

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
  height: 12rem;
  fill: ${({ theme, color }) => color ?? theme.colors.secondaryVariantA};
`;

const StyledLogoSimple = styled(LogoSimple)`
  height: 100%;
  width: auto;
  fill: inherit;
`;

const StyledLogoFull = styled(LogoFull)`
  height: 100%;
  width: auto;
  fill: inherit;
`;

const StyledLogoIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
  height: 5rem;
  fill: ${({ theme, color }) => color ?? theme.colors.secondaryVariantA};
`;

const StyledLogoIcon = styled(LogoSimple)`
  height: 100%;
  width: auto;
  fill: inherit;
`;

export const Logo: FC<LogoProps> = ({ className, full, onClick, ...props }) => {
  const logoSvg = full ? <StyledLogoFull /> : <StyledLogoSimple />;

  return (
    <StyledLogo className={className} onClick={onClick} {...props}>
      {logoSvg}
    </StyledLogo>
  );
};

export const LogoIcon: FC<LogoProps> = ({ className, full, onClick, ...props }) => {
  return (
    <StyledLogoIconContainer className={className} onClick={onClick} {...props}>
      <StyledLogoIcon />
    </StyledLogoIconContainer>
  );
};
