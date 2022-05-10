import styled from 'styled-components';

import { ConnectWalletButton } from '@components/app';
import { OptionList, EthereumIcon, FantomIcon, ArbitrumIcon, Link } from '@components/common';
import { useWindowDimensions } from '@hooks';
import { Network } from '@types';
import { device } from '@themes/default';
import { getConfig } from '@config';

const StyledOptionList = styled(OptionList)`
  width: 15rem;
`;

const StyledNavbarActions = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 1.2rem;
  padding-left: 0.8rem;
  align-items: center;
  justify-content: flex-end;
  flex: 1;

  > * {
    height: 3.2rem;
  }
`;

const StyledText = styled.h1<{ toneDown?: boolean }>`
  display: inline-flex;
  font-size: 2.4rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.titles};
  margin: 0;
  padding: 0;

  ${({ toneDown, theme }) =>
    toneDown &&
    `
    color: ${theme.colors.texts};
  `}
`;

const StyledLink = styled(Link)`
  font-size: 2.4rem;
  font-weight: 700;
`;

const StyledNavbar = styled.header`
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surface};
  z-index: ${({ theme }) => theme.zindex.navbar};
  max-width: ${({ theme }) => theme.globalMaxWidth};
  padding: ${({ theme }) => theme.card.padding};
  border-radius: ${({ theme }) => theme.globalRadius};

  @media ${device.mobile} {
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
    case 'arbitrum':
      return ArbitrumIcon;
    default:
      return;
  }
};

interface NavbarProps {
  className?: string;
  title?: string;
  titleLink?: string;
  subTitle?: string;
  walletAddress?: string;
  addressEnsName?: string;
  onWalletClick?: () => void;
  disableWalletSelect?: boolean;
  selectedNetwork: Network;
  networkOptions: Network[];
  onNetworkChange: (network: string) => void;
  disableNetworkChange?: boolean;
  hideDisabledControls?: boolean;
}

export const Navbar = ({
  className,
  title,
  titleLink,
  subTitle,
  walletAddress,
  addressEnsName,
  onWalletClick,
  disableWalletSelect,
  selectedNetwork,
  networkOptions,
  onNetworkChange,
  disableNetworkChange,
  hideDisabledControls,
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

  const secondTitleEnabled = !!subTitle?.length;

  const vaultText = (
    <>
      &nbsp;/&nbsp;<StyledText>{subTitle}</StyledText>
    </>
  );

  return (
    <StyledNavbar className={className}>
      {title && (
        <StyledText toneDown={secondTitleEnabled}>
          {titleLink ? <StyledLink to={titleLink}>{title}</StyledLink> : title}
          {secondTitleEnabled && vaultText}
        </StyledText>
      )}

      <StyledNavbarActions>
        {!hideDisabledControls && (
          <StyledOptionList
            selected={dropdownSelectedNetwork}
            setSelected={(option) => onNetworkChange(option.value)}
            options={dropdownNetworkOptions}
            hideIcons={isMobile}
            disabled={disableNetworkChange}
          />
        )}

        <ConnectWalletButton
          address={walletAddress}
          ensName={addressEnsName}
          onClick={() => onWalletClick && onWalletClick()}
          disabled={disableWalletSelect}
        />
      </StyledNavbarActions>
    </StyledNavbar>
  );
};
