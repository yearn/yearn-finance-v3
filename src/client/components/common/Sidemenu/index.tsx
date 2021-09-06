import { FC } from 'react';
import styled from 'styled-components';

interface SidemenuProps {
  open: boolean;
}

const StyledSidemenu = styled.div<{ open: boolean }>`
  position: fixed;
  display: flex;
  flex-direction: column;
  top: 0;
  right: 0;
  height: 100%;
  width: 40rem;
  max-width: 100%;
  transition: transform 0.3s ease-in-out;
  z-index: ${(props) => props.theme.zindex.sidemenu};

  transform: ${({ open }) => (open ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)')};
`;

export const Sidemenu: FC<SidemenuProps> = ({ open, children, ...props }) => (
  <StyledSidemenu open={open} {...props}>
    {children}
  </StyledSidemenu>
);
