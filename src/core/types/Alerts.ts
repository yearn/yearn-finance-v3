export interface Alert {
  id: string;
  message: string;
  type: AlertTypes;
  persistent: boolean;
}

export type AlertTypes = 'default' | 'success' | 'error' | 'info' | 'warning';
