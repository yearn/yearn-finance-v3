import { RootState } from '@types';

const selectWallet = (state: RootState) => state.wallet;
const selectWalletIsConnected = (state: RootState) => state.wallet.isConnected;

export const WalletSelectors = {
  selectWallet,
  selectWalletIsConnected,
};
