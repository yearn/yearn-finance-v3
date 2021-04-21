import styled from 'styled-components';
import useWindowDimensions from '@hooks/windowDimensions';

import { ConnectWalletButton } from '@components/app';
import { Icon, HamburguerIcon, Logo } from '@components/common';

interface NavbarProps {
  className?: string;
  walletAddress?: string;
  transparent?: boolean;
  onWalletClick?: () => void;
  toggleSidemenu?: () => void;
}

const StyledMenuButton = styled.div`
  padding: 1rem;
  margin-right: -1rem;
  margin-left: 2rem;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;

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

const StyledNavbar = styled.nav<{ transparent: boolean }>`
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
  z-index: ${(props) => props.theme.zindex.navbar};

  &[transparent] {
    background-color: transparent;
  }
`;

export const Navbar = ({
  className,
  walletAddress,
  transparent = false,
  onWalletClick,
  toggleSidemenu,
}: NavbarProps) => {
  const sidemenuOnlyMobile = false;
  const { isMobile } = useWindowDimensions();

  console.log(transparent);

  let mobileButton;
  let connectWalletButton;
  if ((isMobile && sidemenuOnlyMobile) || !sidemenuOnlyMobile) {
    mobileButton = (
      <StyledMenuButton onClick={toggleSidemenu}>
        <Icon Component={HamburguerIcon} />
      </StyledMenuButton>
    );
  }
  if (!isMobile) {
    connectWalletButton = (
      <ConnectWalletButton address={walletAddress} onClick={() => onWalletClick && onWalletClick()} />
    );
  }

  return (
    <StyledNavbar className={className} transparent={transparent}>
      <Logo full />

      <StyledNavbarActions>
        {connectWalletButton}
        {mobileButton}
      </StyledNavbarActions>
    </StyledNavbar>
  );
};
