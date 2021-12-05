import { Network } from './Blockchain';

export type Language = 'en' | 'de' | 'es' | 'fr' | 'hi' | 'ja' | 'pt' | 'tr' | 'vi' | 'zh';

export type Theme = 'light' | 'dark' | 'cyberpunk' | 'classic' | 'explorer';

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
