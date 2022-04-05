import styled from 'styled-components/macro';

import { Address, Network } from '@types';
import { DefaultscanIcon, EtherscanIcon, FtmscanIcon, ArbiscanIcon, Icon } from '@components/common';

interface ScanNetworkIconProps {
  currentNetwork?: Network;
  blockExplorerUrl?: string;
  address: Address;
}

const IconScan = styled(Icon)`
  fill: ${({ theme }) => theme.colors.onPrimaryVariant};
  padding-left: 5px;
  padding-bottom: 4px;
  &:hover {
    cursor: pointer;
  }
`;

export const ScanNetworkIcon = ({ currentNetwork, blockExplorerUrl, address }: ScanNetworkIconProps) => {
  const handleScanSiteExplorer = () => {
    return window.open(`${blockExplorerUrl}/address/${address}`);
  };

  const selectScanIcon = () => {
    switch (currentNetwork) {
      case 'mainnet':
        return EtherscanIcon;
      case 'fantom':
        return FtmscanIcon;
      case 'arbitrum':
        return ArbiscanIcon;
      default:
        return DefaultscanIcon;
    }
  };

  return <IconScan Component={selectScanIcon()} onClick={handleScanSiteExplorer} />;
};
