import { RootState } from '@types';

const selectWallet = (state: RootState) => state.wallet;
const selectWalletIsConnected = (state: RootState) => state.wallet.isConnected;
const selectSelectedAddress = (state: RootState) => state.wallet.selectedAddress;

export const WalletSelectors = {
  selectWallet,
  selectWalletIsConnected,
  selectSelectedAddress,
};
