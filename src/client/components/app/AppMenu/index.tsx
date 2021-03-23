import { Text, Box } from '@components/common';
import { ConnectWalletButton } from '../ConnectWalletButton';

interface AppMenuProps {
  walletAddress?: string;
  onWalletClick?: () => void;
}

export const AppMenu = ({ walletAddress, onWalletClick }: AppMenuProps) => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Text textColor="primary">Yearn</Text>
      <ConnectWalletButton
        address={walletAddress}
        onClick={() => onWalletClick && onWalletClick()}
      />
    </Box>
  );
};
