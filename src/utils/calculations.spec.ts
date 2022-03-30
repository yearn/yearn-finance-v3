import { computeSummaryData } from './calculations';

describe('Calculations', () => {
  describe('computeSummaryData', () => {
    const labsWithDeposit = [
      {
        address: '0x001',
        apyData: '0.05', // 5%
        DEPOSIT: {
          userBalance: '10000000000000000000', // 10
          userDeposited: '10000000000000000000',
          userDepositedUsdc: '1000000000', // $1,000
        },
      },
      {
        address: '0x002',
        apyData: '0.1', // 10%
        DEPOSIT: {
          userBalance: '100000000000000000000', // 100
          userDeposited: '100000000000000000000',
          userDepositedUsdc: '10000000000', // $10,000
        },
      },
      {
        address: '0x003',
        apyData: '0.2', // 20%
        DEPOSIT: {
          userBalance: '1000000000000000000000', // 1,000
          userDeposited: '1000000000000000000000',
          userDepositedUsdc: '100000000000', // $100,000
        },
      },
    ];

    it('should calculate the summary data for labs', () => {
      const actual = computeSummaryData(labsWithDeposit);

      expect(actual).toEqual({
        estYearlyYield: '0.18963963963963963964', // 18.96% ($21,050 / $111,000)
        totalDeposits: '111000000000', // $111,000 ($100,000 + $10,000 + $1,000)
        totalEarnings: '21050000000', // $21,050 ($1,000 * 5% + $10,000 * 10% + $100,000 * 20%)
      });
    });
  });
});
