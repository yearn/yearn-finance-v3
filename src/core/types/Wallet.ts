import { Network } from './Blockchain';
import { Theme, Language } from './Settings';

export interface Wallet {
  selectedAddress: string | undefined;
  networkVersion: number | undefined;
  balance: string | undefined;
  name: string | undefined;
  provider: unknown | undefined;
  isCreated: Promise<boolean> | boolean;
  isConnected: Promise<boolean> | boolean;
  create: (
    network: Network,
    subscriptions: Subscriptions,
    theme?: Theme,
    language?: Language
  ) => Promise<boolean> | boolean;
  connect: (args?: any) => Promise<boolean>;
  changeTheme?: (theme: Theme) => void;
}

export interface Subscriptions {
  address?: (address: string) => void;
  network?: (networkId: number) => void;
  balance?: (balance: string) => void;
  wallet?: (wallet: any) => void;
}
