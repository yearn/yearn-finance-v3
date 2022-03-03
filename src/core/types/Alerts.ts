export interface Alert {
  id: number;
  message: string;
  type: AlertTypes;
  persistent: boolean;
}

export type AlertTypes = 'default' | 'success' | 'error' | 'info' | 'warning';
