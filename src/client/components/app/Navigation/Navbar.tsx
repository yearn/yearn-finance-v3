import styled from 'styled-components';
import useWindowDimensions from '@hooks/windowDimensions';

import { ConnectWalletButton } from '@components/app';
import { Icon, HamburguerIcon } from '@components/common';

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
`;
const StyledNavbarActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
`;

const StyledNavbar = styled.nav`
  display: flex;
  align-items: center;
  background-color: ${(props) => props.theme.colors.shade90};
  height: ${(props) => props.theme.navbarHeight};
  border-bottom: 1px solid ${(props) => props.theme.colors.shade40};
  padding: 0 2rem;
`;

export const Navbar = ({ className, walletAddress, onWalletClick, toggleSidemenu }: NavbarProps) => {
  const sidemenuOnlyMobile = false;
  const { isMobile } = useWindowDimensions();

  let mobileButton;
  if ((isMobile && sidemenuOnlyMobile) || !sidemenuOnlyMobile) {
    mobileButton = (
      <StyledMenuButton onClick={toggleSidemenu}>
        <Icon src={HamburguerIcon} height="24" />
      </StyledMenuButton>
    );
  }

  return (
    <StyledNavbar className={className}>
      <StyledNavbarActions>
        <ConnectWalletButton address={walletAddress} onClick={() => onWalletClick && onWalletClick()} />
        {mobileButton}
      </StyledNavbarActions>
    </StyledNavbar>
  );
};
