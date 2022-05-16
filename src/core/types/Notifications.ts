export type Classification = 'info' | 'warning' | 'critical';

export interface Message {
  id: number;
  type: Classification;
  active: boolean;
  message: string;
}
