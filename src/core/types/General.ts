export type Amount = string;

export type Fraction = string;

export type FormattedAmount = string;

export type DataType = 'amount' | 'percent' | 'usd';

export type Route = 'home' | 'wallet' | 'vaults' | 'vault' | 'labs' | 'ironbank';

export type Service = 'zapper' | 'tenderly' | 'notify';

export type YDeepPartial<T> = T extends object ? { [P in keyof T]?: YDeepPartial<T[P]> } : T;
