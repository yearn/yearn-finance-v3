import { useContext } from 'react';
import styled from 'styled-components';

import { NavSideMenuContext } from '@context';
import { Navbar } from './Navbar';
import { NavSidemenu } from './NavSidemenu';

interface NavigationProps {
  walletAddress?: string;
  onWalletClick?: () => void;
}

const StyledNavigation = styled.nav``;

export const Navigation = ({ walletAddress, onWalletClick }: NavigationProps) => {
  const { isOpen, toggle: toggleNavSidemenu } = useContext(NavSideMenuContext);
  return (
    <StyledNavigation>
      <NavSidemenu walletAddress={walletAddress} onWalletClick={() => onWalletClick && onWalletClick()} open={isOpen} />
      <Navbar
        walletAddress={walletAddress}
        onWalletClick={() => onWalletClick && onWalletClick()}
        toggleSidemenu={toggleNavSidemenu}
      />
    </StyledNavigation>
  );
};
