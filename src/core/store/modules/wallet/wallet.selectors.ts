import { getNetwork } from '@utils';
import { RootState } from '@types';

const selectWallet = (state: RootState) => state.wallet;
const selectWalletIsLoading = (state: RootState) => state.wallet.isLoading;
const selectWalletIsConnected = (state: RootState) => state.wallet.isConnected;
const selectSelectedAddress = (state: RootState) => state.wallet.selectedAddress;
const selectAddressEnsName = (state: RootState) => state.wallet.addressEnsName;
const selectWalletNetwork = (state: RootState) =>
  state.wallet.networkVersion ? getNetwork(state.wallet.networkVersion) : undefined;

export const WalletSelectors = {
  selectWallet,
  selectWalletIsLoading,
  selectWalletIsConnected,
  selectSelectedAddress,
  selectAddressEnsName,
  selectWalletNetwork,
};
