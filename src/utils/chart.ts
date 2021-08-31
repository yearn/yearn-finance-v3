import { EarningsDayData } from '@yfi/sdk';
import { normalizeAmount, toBN } from './format';

export function parseHistoricalEarnings(earnings?: EarningsDayData[]) {
  if (!earnings) return [{ id: 'japan', data: [] }]; // TODO what should id be?
  const chartData = earnings.map((data) => {
    return {
      x: data.date.toString().split('T')[0],
      y: toBN(normalizeAmount(data.earnings.amountUsdc, 6)).toFixed(),
    };
  });

  return [{ id: 'japan', data: chartData }]; // TODO what should id be?
}
