import styled from 'styled-components';

import { useSideMenu } from '@hooks';
import { Navbar } from './Navbar';
import { Sidemenu } from './Sidemenu';

interface NavigationProps {
  walletAddress?: string;
  onWalletClick?: () => void;
}

const StyledNavigation = styled.nav``;

export const Navigation = ({ walletAddress, onWalletClick }: NavigationProps) => {
  const { isOpen, toggle } = useSideMenu({ opened: false });

  return (
    <StyledNavigation>
      <Sidemenu walletAddress={walletAddress} onWalletClick={() => onWalletClick && onWalletClick()} open={isOpen} />
      <Navbar
        walletAddress={walletAddress}
        onWalletClick={() => onWalletClick && onWalletClick()}
        toggleSidemenu={toggle}
      />
    </StyledNavigation>
  );
};
