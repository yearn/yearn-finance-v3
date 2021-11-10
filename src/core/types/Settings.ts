import { Network } from './Blockchain';

export type Language = 'en' | 'de' | 'es' | 'hi' | 'pt' | 'zh';

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
