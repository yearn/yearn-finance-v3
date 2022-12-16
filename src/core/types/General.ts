export type Amount = string;

export type Fraction = string;

export type FormattedAmount = string;

export type DataType = 'amount' | 'percent' | 'usd';

export type Route = 'portfolio' | 'vaults' | 'vault' | 'labs' | 'veyfi';

export type ExternalServiceId = 'zaps' | 'simulations' | 'notifications';

export type YDeepPartial<T> = T extends object ? { [P in keyof T]?: YDeepPartial<T[P]> } : T;

export type Seconds = number;
export type Milliseconds = number;
export type Weeks = number;
