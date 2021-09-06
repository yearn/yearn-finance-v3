import { EarningsDayData } from '@types';
import { normalizeAmount, toBN, USDC_DECIMALS } from './format';

export function parseHistoricalEarnings(earnings?: EarningsDayData[]) {
  let chartData: { x: string; y: string }[] = [];
  const id = 'historicalEarnings';
  if (!earnings) return [{ id, data: chartData }];
  chartData = earnings.map((data) => {
    return {
      x: data.date.toString().split('T')[0],
      y: toBN(normalizeAmount(data.earnings.amountUsdc, USDC_DECIMALS)).toFixed(),
    };
  });

  return [{ id, data: chartData }];
}

export function parseLastEarnings(earnings?: EarningsDayData[]) {
  return toBN(normalizeAmount(earnings?.slice(-1)[0]?.earnings?.amountUsdc, USDC_DECIMALS)).toFixed();
}
