import { Network } from './Blockchain';
import { Theme, Language } from './Settings';

export interface Wallet {
  selectedAddress: string | undefined;
  networkVersion: number | undefined;
  name: string | undefined;
  provider: any | undefined;
  isCreated: boolean;
  isConnected: Promise<boolean> | boolean;
  create: (
    network: Network,
    subscriptions: Subscriptions,
    theme?: Theme,
    language?: Language
  ) => Promise<boolean> | boolean;
  connect: (args?: any) => Promise<boolean>;
  changeTheme?: (theme: Theme) => void;
  changeNetwork?: (network: Network) => Promise<boolean>;
  addToken?: (tokenAddress: string, tokenSymbol: string, tokenDecimals: number, tokenImage: string) => Promise<boolean>;
}

export interface Subscriptions {
  address?: (address: string | undefined) => void;
  network?: (networkId: number | undefined) => void;
  wallet?: (wallet: any | undefined) => void;
  ens?: (ens: any | undefined) => void;
}
