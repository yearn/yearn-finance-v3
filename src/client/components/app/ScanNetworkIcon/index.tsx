import styled from 'styled-components';
import { Address, Network } from '@types';
import { DefaultscanIcon, EtherscanIcon, FtmscanIcon, Icon } from '@components/common';

interface ScanNetworkIconProps {
  currentNetwork?: Network;
  blockExplorerUrl?: string;
  address: Address;
}

const IconScan = styled(Icon)`
  fill: black;
  padding-left: 5px;
  padding-bottom: 4px;
  &:hover {
    cursor: pointer;
  }
`;

export const ScanNetworkIcon = ({ currentNetwork, blockExplorerUrl, address }: ScanNetworkIconProps) => {
  const handleScanSiteExplorer = () => {
    return window.open(`${blockExplorerUrl}${address}`);
  };

  const selectScanIcon = () => {
    switch (currentNetwork) {
      case 'mainnet':
        return EtherscanIcon;
      case 'fantom':
        return FtmscanIcon;
      default:
        return DefaultscanIcon;
    }
  };

  return <IconScan Component={selectScanIcon()} onClick={handleScanSiteExplorer} />;
};
