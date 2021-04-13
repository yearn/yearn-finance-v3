import BigNumber from 'bignumber.js';
import { formatUnits, BigNumber as EthersBN } from '@frameworks/ethers';

const format = {
  prefix: '',
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
  suffix: '',
};

export const formatAmount = (amount: string, decimals: number) => {
  return new BigNumber(amount).toFormat(decimals, format);
};

export const weiToUnits = (amount: string, decimals: number) => formatUnits(EthersBN.from(amount), decimals);

export const formatPercent = (amount: string, decimals: number) => {
  return new BigNumber(amount).times(100).toFormat(decimals, { ...format, prefix: '%' });
};

export const humanizeAmount = (amount: string | undefined, tokenDecimals: number, wantedDecimals: number) => {
  if (!amount || !tokenDecimals || !wantedDecimals) {
    return '0';
  }
  const units = weiToUnits(amount, tokenDecimals);
  return formatAmount(units, wantedDecimals);
};
