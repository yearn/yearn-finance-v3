import BigNumber from 'bignumber.js';

import { Unit, Wei } from '@types';

import { toBN, toUnit } from './format';

interface CalculateSharesAmountProps {
  decimals: string;
  pricePerShare: string;
  amount: BigNumber;
}

export function calculateSharesAmount(props: CalculateSharesAmountProps): Wei {
  const { amount, decimals, pricePerShare } = props;
  if (amount.isNaN()) return '0';
  const sharePrice = toUnit(pricePerShare, parseInt(decimals));
  const ONE_UNIT = toBN('10').pow(decimals);
  return amount.div(sharePrice).times(ONE_UNIT).toFixed(0);
}

interface CalculateUnderlyingAmountProps {
  tokenDecimals: string;
  pricePerShare: string;
  shareAmount: Unit;
}

export function calculateUnderlyingAmount(props: CalculateUnderlyingAmountProps): Wei {
  const { tokenDecimals, pricePerShare } = props;
  const amount = toBN(props.shareAmount);
  if (amount.isNaN()) return '0';
  const sharePrice = toUnit(pricePerShare, parseInt(tokenDecimals));
  const ONE_UNIT = toBN('10').pow(tokenDecimals);
  return amount.times(sharePrice).times(ONE_UNIT).toFixed(0);
}
