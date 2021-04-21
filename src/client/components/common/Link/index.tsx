import { AnchorHTMLAttributes, FC } from 'react';
import styled from 'styled-components';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
}

const StyledLink = styled.a`
  color: inherit;
`;

export const Link: FC<LinkProps> = ({ className, ...props }) => <StyledLink className={className} {...props} />;
