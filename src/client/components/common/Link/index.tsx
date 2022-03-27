import { AnchorHTMLAttributes, FC } from 'react';
import styled from 'styled-components/macro';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
}

const StyledLink = styled.a`
  color: inherit;
  font-size: 1.4rem;
`;

export const Link: FC<LinkProps> = ({ className, ...props }) => <StyledLink className={className} {...props} />;
