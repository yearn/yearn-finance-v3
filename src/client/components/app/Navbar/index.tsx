import styled from 'styled-components';
import useWindowDimensions from '@hooks/windowDimensions';

import { ConnectWalletButton } from '@components/app';

interface NavbarProps {
  className?: string;
  walletAddress?: string;
  onWalletClick?: () => void;
  toggleSidemenu?: () => void;
}

const StyledNavbarActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
`;

const StyledNavbar = styled.nav`
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  background-color: ${(props) => props.theme.colors.shade90};
  height: ${(props) => props.theme.navbar.height};
  border-bottom: 1px solid ${(props) => props.theme.colors.shade40};
  padding: 0 ${(props) => props.theme.navbar.padding};
  z-index: ${(props) => props.theme.zindex.navbar};
`;

export const Navbar = ({ className, walletAddress, onWalletClick }: NavbarProps) => {
  const { isMobile } = useWindowDimensions();

  let connectWalletButton;

  if (!isMobile) {
    connectWalletButton = (
      <ConnectWalletButton address={walletAddress} onClick={() => onWalletClick && onWalletClick()} />
    );
  }

  return (
    <StyledNavbar className={className}>
      <StyledNavbarActions>{connectWalletButton}</StyledNavbarActions>
    </StyledNavbar>
  );
};
