import { useContext } from 'react';
import styled from 'styled-components';
import { BladeContext } from '@context';

import { Sidemenu, Icon, DeleteIcon, Button } from '@components/common';

interface SidemenuProps {
  walletAddress?: string;
  onWalletClick?: () => void;
  open: boolean;
}

const StyledBlade = styled(Sidemenu)<{ open: boolean }>`
  background: red;
  background-color: ${(props) => props.theme.colors.shade40};
  width: 40rem;
  max-width: 100%;
  z-index: ${(props) => props.theme.zindex.navSidemenu};
`;

const BladeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${(props) => props.theme.navbar.height};
  padding: 0 ${(props) => props.theme.navbar.padding};
`;

const BladeContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${(props) => props.theme.navbar.padding};
  padding-top: 1rem;
`;

const StyledMenuButton = styled.div`
  padding: 1rem;
  margin-right: -1rem;
  flex-shrink: 0;
`;

export const NavSidemenu = ({ walletAddress, onWalletClick, open }: SidemenuProps) => {
  const { toggle } = useContext(BladeContext);

  return (
    <StyledBlade open={open}>
      <BladeHeader>
        <StyledMenuButton onClick={toggle}>
          <Icon src={DeleteIcon} height="24" />
        </StyledMenuButton>
      </BladeHeader>

      <BladeContent>
        <div>
          <input type="number" />
          <Button>Deposit</Button>
          <Button>Approve</Button>
        </div>
        <div>
          <input type="number" />
          <Button>Withdraw</Button>
        </div>
      </BladeContent>
    </StyledBlade>
  );
};
