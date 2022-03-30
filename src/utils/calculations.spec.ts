import { GeneralLabView, GeneralVaultView, YDeepPartial } from '@src/core/types';

import { calculateCombinedApy } from './calculations';

describe('Calculations', () => {
  describe('calculateCombinedApy', () => {
    const lab: YDeepPartial<GeneralLabView> = {
      DEPOSIT: {
        userDepositedUsdc: '1000',
      },
      apyMetadata: {
        net_apy: 0.2,
      },
    };

    const vault: YDeepPartial<GeneralVaultView> = {
      DEPOSIT: {
        userDepositedUsdc: '3000',
      },
      apyMetadata: {
        net_apy: 0.1,
      },
    };

    const vaultWithoutApyMetadata: YDeepPartial<GeneralVaultView> = {
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
