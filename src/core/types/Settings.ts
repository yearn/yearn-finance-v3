import { Network } from './Blockchain';

export type Language = 'en' | 'de' | 'es' | 'fr' | 'hi' | 'ja' | 'pt' | 'tr' | 'vi' | 'zh';

export type Theme = 'system-prefs' | 'light' | 'dark' | 'cyberpunk' | 'classic' | 'explorer' | 'light-new';

export interface NetworkSettings {
  [network: string]: {
    id: Network;
    name: string;
    networkId: number;
    rpcUrl: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    simulationsEnabled?: boolean;
    zapsEnabled?: boolean;
    labsEnabled?: boolean;
    ironBankEnabled?: boolean;
    earningsEnabled?: boolean;
    notifyEnabled?: boolean;
    blockExplorerUrl?: string;
    txConfirmations?: number;
  };
}
