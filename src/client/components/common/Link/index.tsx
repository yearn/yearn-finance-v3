import { FC } from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import styled, { css } from 'styled-components';

export interface LinkProps extends RouterLinkProps {
  className?: string;
  external?: boolean;
}

const StyledLink = css`
  color: inherit;
  font-size: 1.4rem;
`;

const ExternalLink = styled.a`
  ${StyledLink}
`;
const StyledRouterLink = styled(RouterLink)`
  ${StyledLink}
`;

export const Link: FC<LinkProps> = ({ to, className, target, external, children, ...props }) => {
  if (external) {
    return (
      <ExternalLink target={target || '_blank'} href={to.toString()} className={className}>
        {children}
      </ExternalLink>
    );
  }

  return (
    <StyledRouterLink to={to} className={className} {...props}>
      {children}
    </StyledRouterLink>
  );
};
