import BigNumber from 'bignumber.js';

import { formatUnits } from '@frameworks/ethers';
import { Wei } from '@types';

import { toBN } from './format';

interface CalculateSharesAmountProps {
  decimals: string;
  pricePerShare: string;
  amount: BigNumber;
}

export function calculateSharesAmount(props: CalculateSharesAmountProps): Wei {
  const { amount, decimals, pricePerShare } = props;
  if (amount.isNaN()) return '0';
  const sharePrice = formatUnits(pricePerShare, decimals);
  const ONE_UNIT = toBN('10').pow(decimals);
  return amount.dividedBy(sharePrice).multipliedBy(ONE_UNIT).toFixed(0);
}
