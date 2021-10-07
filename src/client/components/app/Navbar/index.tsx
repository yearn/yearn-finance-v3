import styled from 'styled-components';

import { ConnectWalletButton } from '@components/app';
import { Button, Text, OptionList, EthereumIcon, FantomIcon } from '@components/common';

import { useWindowDimensions } from '@hooks';
import { Network } from '@types';
import { device } from '@themes/default';
import { getConfig } from '@config';

const BetaButton = styled(Button)`
  white-space: nowrap;
  cursor: default;
  border-color: ${({ theme }) => theme.colors.walletButton.background};
  color: ${({ theme }) => theme.colors.walletButton.background};
`;

const StyledOptionList = styled(OptionList)`
  width: 14rem;
`;

const StyledNavbarActions = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 0.8rem;
  padding-left: 0.8rem;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
`;

const StyledText = styled.h1`
  font-size: 2.4rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
  margin: 0;
  padding: 0;
`;

const StyledNavbar = styled.header`
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: ${(props) => props.theme.zindex.navbar};
  max-width: ${({ theme }) => theme.globalMaxWidth};
  margin-top: -${({ theme }) => theme.layoutPadding};
  padding-top: calc(0.4rem + ${({ theme }) => theme.layoutPadding});
  padding-bottom: 1.6rem;

  @media ${device.mobile} {
    ${BetaButton} {
      display: none;
    }
    ${StyledText} {
      font-size: 1.9rem;
    }
    ${StyledOptionList} {
      width: auto;
    }
  }
`;

const getNetworkIcon = (network: Network) => {
  switch (network) {
    case 'mainnet':
      return EthereumIcon;
    case 'fantom':
      return FantomIcon;
    default:
      return;
  }
};

interface NavbarProps {
  className?: string;
  title?: string;
  walletAddress?: string;
  addressEnsName?: string;
  onWalletClick?: () => void;
  selectedNetwork: Network;
  networkOptions: Network[];
  onNetworkChange: (network: string) => void;
  disableNetworkChange?: boolean;
}

export const Navbar = ({
  className,
  title,
  walletAddress,
  addressEnsName,
  onWalletClick,
  selectedNetwork,
  networkOptions,
  onNetworkChange,
  disableNetworkChange,
}: NavbarProps) => {
  const { isMobile } = useWindowDimensions();
  const { NETWORK_SETTINGS } = getConfig();

  const dropdownSelectedNetwork = {
    value: selectedNetwork,
    label: NETWORK_SETTINGS[selectedNetwork].name,
    Icon: getNetworkIcon(selectedNetwork),
  };
  const dropdownNetworkOptions = networkOptions.map((network, i) => ({
    value: network,
    label: NETWORK_SETTINGS[network].name,
    Icon: getNetworkIcon(network),
  }));

  return (
    <StyledNavbar className={className}>
      {title && <StyledText>{title}</StyledText>}

      <StyledNavbarActions>
        <BetaButton outline>BETA</BetaButton>

        <StyledOptionList
          selected={dropdownSelectedNetwork}
          setSelected={(option) => onNetworkChange(option.value)}
          options={dropdownNetworkOptions}
          hideIcons={isMobile}
          disabled={disableNetworkChange}
        />

        <ConnectWalletButton
          address={walletAddress}
          ensName={addressEnsName}
          onClick={() => onWalletClick && onWalletClick()}
        />
      </StyledNavbarActions>
    </StyledNavbar>
  );
};
