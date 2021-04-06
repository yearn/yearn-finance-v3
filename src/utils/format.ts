import BigNumber from 'bignumber.js';
import { formatUnits, BigNumber as EthersBN } from '@frameworks/ethers';

export const formatAmount = (amount: string, decimals: number) => {
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

  return new BigNumber(amount).toFormat(decimals, format);
};

export const weiToUnits = (amount: string, decimals: number) => formatUnits(EthersBN.from(amount), decimals);
