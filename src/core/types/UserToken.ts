export interface UserTokenData {
  address: string;
  balance: string;
  balanceUsdc: string;
  allowancesMap: { [spenderAddress: string]: string };
}
