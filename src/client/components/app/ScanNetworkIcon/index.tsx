import styled from 'styled-components';
import { GeneralVaultView, Network } from '@types';
import { DefaultscanIcon, EtherscanIcon, FtmscanIcon, Icon } from '@components/common';

interface ScanNetworkIconProps {
  currentNetwork?: Network;
  blockExplorerUrl?: string;
  selectedVault: GeneralVaultView;
}

const IconScan = styled(Icon)`
  fill: black;
  padding-left: 5px;
  padding-bottom: 4px;
  &:hover {
    cursor: pointer;
  }
`;

export const ScanNetworkIcon = ({ currentNetwork, blockExplorerUrl, selectedVault }: ScanNetworkIconProps) => {
  const handleScanSiteExplorer = () => {
    switch (currentNetwork) {
      case 'mainnet':
        return window.open(`${blockExplorerUrl}${selectedVault.address}`);
      case 'fantom':
        return window.open(`${blockExplorerUrl}${selectedVault.address}`);
      default:
        return;
    }
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
