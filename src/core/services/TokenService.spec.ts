import { createMockToken } from '@src/test';

import { TokenServiceImpl } from './TokenService';

const supportedTokensMock = jest.fn();
const getLabsTokensMock = jest.fn();

describe('TokenService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSupportedTokens', () => {
    let tokenService: TokenServiceImpl;

    beforeEach(() => {
      tokenService = new TokenServiceImpl({} as any);
      (tokenService as any).yearnSdk = {
        getInstanceOf: () => ({
          tokens: {
            supported: supportedTokensMock,
          },
        }),
      };
      tokenService.getLabsTokens = getLabsTokensMock;
    });

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

      supportedTokensMock.mockReturnValue([zapperToken, zapperTokenInLabs]);
      getLabsTokensMock.mockResolvedValueOnce([labsToken]);

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
      expect(getLabsTokensMock).toHaveBeenCalledWith({ network: 'mainnet' });
    });
  });
});
