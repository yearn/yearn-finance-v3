import { Network } from './Blockchain';

export type Language = 'en' | 'es';

export type Theme = 'light' | 'dark' | 'cyberpunk' | 'classic';

export interface NetworkSettings {
  [network: string]: {
    id: Network;
    name: string;
    networkId: number;
    simulationsEnabled?: boolean;
    zapsEnabled?: boolean;
    labsEnabled?: boolean;
    ironBankEnabled?: boolean;
    earningsEnabled?: boolean;
    notifyEnabled?: boolean;
    blockExplorerUrl?: string;
  };
}
