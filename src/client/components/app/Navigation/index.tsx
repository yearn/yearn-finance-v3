import styled from 'styled-components';

import { Navbar } from './Navbar';
import { Sidemenu } from './Sidemenu';

interface NavigationProps {
  walletAddress?: string;
  onWalletClick?: () => void;
}

const StyledNavigation = styled.nav``;

export const Navigation = ({ walletAddress, onWalletClick }: NavigationProps) => {
  const open = true;
  return (
    <StyledNavigation>
      <Sidemenu walletAddress={walletAddress} onWalletClick={() => onWalletClick && onWalletClick()} open={open} />
      <Navbar walletAddress={walletAddress} onWalletClick={() => onWalletClick && onWalletClick()} />
    </StyledNavigation>
  );
};
