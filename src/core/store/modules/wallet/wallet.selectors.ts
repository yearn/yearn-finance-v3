import { RootState } from '@types';

export const selectWallet = (state: RootState) => state.wallet;
export const selectWalletIsConnected = (state: RootState) => state.wallet.isConnected;
