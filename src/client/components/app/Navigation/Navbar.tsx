import styled from 'styled-components';
import useWindowDimensions from '@hooks/windowDimensions';

import { ConnectWalletButton } from '@components/app';

interface NavbarProps {
  walletAddress?: string;
  onWalletClick?: () => void;
}

const StyledNavbar = styled.nav`
  display: flex;
  align-items: center;
  background-color: ${(props) => props.theme.colors.shade90};
  height: ${(props) => props.theme.navbarHeight};
  border-bottom: 1px solid ${(props) => props.theme.colors.shade40};
  padding: 0 2rem;
`;

export const Navbar = ({ walletAddress, onWalletClick }: NavbarProps) => {
  const { isMobile } = useWindowDimensions();
  let mobileButton;
  if (isMobile) {
    mobileButton = <button>Mobile!</button>;
  }

  return (
    <StyledNavbar>
      Yearn navbar
      <ConnectWalletButton address={walletAddress} onClick={() => onWalletClick && onWalletClick()} />
      {mobileButton}
    </StyledNavbar>
  );
};
