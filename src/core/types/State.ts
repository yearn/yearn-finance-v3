import { Theme } from './Settings';
import { Wallet } from './Wallet';

export interface RootState {
  app: AppState;
  route: RouteState;
  theme: ThemeState;
  wallet: WalletState;
}

export interface AppState {
  isInitialized: boolean;
}

export interface RouteState {
  path: string | undefined;
}

export interface ThemeState {
  current: Theme;
}

export interface WalletState {
  selectedAddress: string | undefined;
  networkVersion: number | undefined;
  balance: string | undefined;
  name: string | undefined;
  isConnected: boolean;
  isLoading: boolean;
  error: string | undefined;
}
