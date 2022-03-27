import { PartialDeep } from 'type-fest';

import { GeneralLabView, GeneralVaultView } from '@src/core/types';

import { calculateCombinedApy } from './calculations';

describe('Calculations', () => {
  describe('calculateCombinedApy', () => {
    const lab: PartialDeep<GeneralLabView> = {
      DEPOSIT: {
        userDepositedUsdc: '1000',
      },
      apyMetadata: {
        net_apy: 0.2,
      },
    };

    const vault: PartialDeep<GeneralVaultView> = {
      DEPOSIT: {
        userDepositedUsdc: '3000',
      },
      apyMetadata: {
        net_apy: 0.1,
      },
    };

    const vaultWithoutApyMetadata: PartialDeep<GeneralVaultView> = {
      DEPOSIT: {
        userDepositedUsdc: '1000',
      },
    };

    it('should calculate the average APY', () => {
      const actual = calculateCombinedApy([
        [lab.apyMetadata?.net_apy, lab.DEPOSIT?.userDepositedUsdc],
        [vault.apyMetadata?.net_apy, vault.DEPOSIT?.userDepositedUsdc],
        [vaultWithoutApyMetadata.apyMetadata?.net_apy, vaultWithoutApyMetadata.DEPOSIT?.userDepositedUsdc],
      ]);
      expect(actual).toEqual(0.125);
    });
  });
});
