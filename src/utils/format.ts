import BigNumber from 'bignumber.js';

import { Wei, Unit, Amount, FormattedAmount, Fraction } from '@types';

BigNumber.set({ EXPONENTIAL_AT: 50 });

export const USDC_DECIMALS = 6;
export const COLLATERAL_FACTOR_DECIMALS = 18;
export const GWEI = 9;

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

/* -------------------------------------------------------------------------- */
/*                                    Parse                                   */
/* -------------------------------------------------------------------------- */

export const toBN = (amount?: Amount | number): BigNumber => {
  if (!amount || amount === '') {
    amount = '0';
  }
  return new BigNumber(amount);
};

export const toWei = (amount: Unit, decimals: number): Wei => {
  const ONE_UNIT = toBN(10).pow(decimals);
  return toBN(amount).times(ONE_UNIT).toFixed(0);
};

export const toUnit = (amount: Wei | undefined, decimals: number): Unit => normalizeAmount(amount, decimals);

/* -------------------------------------------------------------------------- */
/*                                  Normalize                                 */
/* -------------------------------------------------------------------------- */

export const normalizeAmount = (amount: Wei | undefined, decimals: number): Unit => {
  if (!amount || amount === '') {
    amount = '0';
  }
  const ONE_UNIT = toBN(10).pow(decimals);
  return toBN(amount).div(ONE_UNIT).toString();
};

export const normalizePercent = (amount: Fraction, decimals: number): Unit =>
  formatPercent(
    toBN(amount)
      .div(10 ** 4)
      .toString(),
    decimals
  );

export const normalizeUsdc = (amount?: Wei, decimals = 2): Unit => {
  if (!amount || amount === '') {
    amount = '0';
  }
  const units = toUnit(amount, USDC_DECIMALS);
  return formatUsd(units, decimals);
};

/* -------------------------------------------------------------------------- */
/*                                   Format                                   */
/* -------------------------------------------------------------------------- */

export const formatAmount = (amount: Amount, decimals: number): FormattedAmount => {
  return toBN(amount).toFormat(decimals, BigNumber.ROUND_FLOOR, format);
};

export const formatPercent = (amount: Fraction, decimals: number): FormattedAmount => {
  return toBN(amount)
    .times(100)
    .toFormat(decimals, { ...format, suffix: '%' });
};

export const formatUsd = (amount?: Amount, decimals = 2): FormattedAmount => {
  if (!amount || amount === '') {
    amount = '0';
  }
  return toBN(amount ?? '0').toFormat(decimals, { ...format, prefix: '$ ' });
};

export const formatApy = (apyData: Fraction, apyType: string): FormattedAmount => {
  if (apyType === 'new') return 'NEW ✨';
  if (apyType === 'n/a') return 'N/A';

  return formatPercent(apyData, 2);
};

/* -------------------------------------------------------------------------- */

export const humanizeAmount = (amount: string | undefined, tokenDecimals: number, wantedDecimals: number) => {
  if (!amount || !tokenDecimals) {
    return '0';
  }
  const units = toUnit(amount, tokenDecimals);
  return formatAmount(units, wantedDecimals);
};
