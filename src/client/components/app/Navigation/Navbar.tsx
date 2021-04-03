import styled from 'styled-components';
import useWindowDimensions from '@hooks/windowDimensions';

import { ConnectWalletButton } from '@components/app';
import { Icon, HamburguerIcon, Logo } from '@components/common';

interface NavbarProps {
  className?: string;
  walletAddress?: string;
  onWalletClick?: () => void;
  toggleSidemenu?: () => void;
}

const StyledMenuButton = styled.div`
  padding: 1rem;
  margin-right: -1rem;
  margin-left: 2rem;
  flex-shrink: 0;
  cursor: pointer;
  img {
    height: 1.8rem;
  }
`;
const StyledNavbarActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
`;

const StyledNavbar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  background-color: ${(props) => props.theme.colors.shade90};
  height: ${(props) => props.theme.navbar.height};
  border-bottom: 1px solid ${(props) => props.theme.colors.shade40};
  padding: 0 ${(props) => props.theme.navbar.padding};
`;

export const Navbar = ({ className, walletAddress, onWalletClick, toggleSidemenu }: NavbarProps) => {
  const sidemenuOnlyMobile = false;
  const { isMobile } = useWindowDimensions();

  let mobileButton;
  let connectWalletButton;
  if ((isMobile && sidemenuOnlyMobile) || !sidemenuOnlyMobile) {
    mobileButton = (
      <StyledMenuButton onClick={toggleSidemenu}>
        <Icon src={HamburguerIcon} />
      </StyledMenuButton>
    );
  }
  if (!isMobile) {
    connectWalletButton = (
      <ConnectWalletButton address={walletAddress} onClick={() => onWalletClick && onWalletClick()} />
    );
  }

  return (
    <StyledNavbar className={className}>
      <Logo full />

      <StyledNavbarActions>
        {connectWalletButton}
        {mobileButton}
      </StyledNavbarActions>
    </StyledNavbar>
  );
};
