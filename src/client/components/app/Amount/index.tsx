import { useState } from 'react';
import CountUp from 'react-countup';

import { Text, TextProps } from '@components/common';
import { normalizeAmount, USDC_DECIMALS } from '@src/utils';

export interface AmountProps extends TextProps {
  value: number | string;
  input?: 'decimal' | 'wei' | 'usdc' | 'weipercent' | 'percent';
  decimals?: number;
  output?: 'formatted' | 'usd' | 'percent';
  showDecimals?: boolean;
}

export const Amount = ({
  value,
  input = 'decimal',
  decimals = 18,
  output,
  showDecimals = true,
  ...props
}: AmountProps) => {
  let amount: number;

  if (typeof value === 'string') {
    switch (input) {
      case 'wei':
        amount = parseFloat(normalizeAmount(value, decimals));
        if (!output) output = 'formatted';
        break;
      case 'usdc':
        amount = parseFloat(normalizeAmount(value, USDC_DECIMALS));
        if (!output) output = 'usd';
        break;
      case 'weipercent':
        amount = parseFloat(normalizeAmount(value, 2));
        if (!output) output = 'percent';
        break;
      case 'percent':
        amount = parseFloat(value) * 100;
        if (!output) output = 'percent';
        break;
      default:
        amount = parseFloat(value);
        break;
    }
  } else {
    amount = value;
  }

  const [initialAmount] = useState(amount);

  let format;
  switch (output) {
    case 'usd':
      format = {
        prefix: '$ ',
        decimals: showDecimals ? 2 : 0,
      };
      break;
    case 'percent':
      format = {
        suffix: '%',
        decimals: showDecimals ? 2 : 0,
      };
      break;
    default:
      format = {
        decimals: showDecimals ? 4 : 0,
      };
      break;
  }

  return (
    <Text {...props}>
      <CountUp start={initialAmount} end={amount} preserveValue duration={2.5} decimal="." separator="," {...format} />
    </Text>
  );
};
