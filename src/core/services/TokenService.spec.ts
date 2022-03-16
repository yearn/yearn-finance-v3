import { createMockToken } from '@src/test';

import { TokenServiceImpl } from './TokenService';

describe('TokenService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSupportedTokens', () => {
    it('should merge labs with zapper tokens', async () => {
      const zapperToken = createMockToken({
        address: '0x001',
        name: 'Zapper Token 1',
        supported: { zapper: true },
      });
      const labsToken = createMockToken({
        address: '0x002',
        name: 'Labs Token',
        icon: 'labs.icon',
      });
      const zapperTokenInLabs = createMockToken({
        address: '0x002',
        name: 'Zapper Token 2',
        icon: 'zapper.icon',
        supported: { zapper: true },
      });

      const tokenService = new TokenServiceImpl({
        yearnSdk: {
          getInstanceOf: () => ({
            tokens: {
              supported: jest.fn().mockResolvedValueOnce([zapperToken, zapperTokenInLabs]),
            },
          }),
        },
      } as any);

      tokenService.getLabsTokens = jest.fn().mockResolvedValueOnce([labsToken]);

      const actualGetSupportedTokens = await tokenService.getSupportedTokens({ network: 'mainnet' });

      expect(actualGetSupportedTokens.length).toEqual(2);
      expect(actualGetSupportedTokens).toEqual(
        expect.arrayContaining([
          {
            ...zapperToken,
            address: '0x001',
            name: 'Zapper Token 1',
            supported: { zapper: true },
          },
          { ...labsToken, address: '0x002', name: 'Labs Token', icon: 'labs.icon', supported: { zapper: true } },
        ])
      );
    });
  });
});
