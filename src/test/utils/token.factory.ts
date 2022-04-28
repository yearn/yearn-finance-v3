import { Token } from '@src/core/types';

const DEFAULT_TOKEN: Token = {
  address: '0x001',
  decimals: '18',
  symbol: 'DEAD',
  name: 'Dead Token',
  priceUsdc: '0',
  dataSource: 'vaults',
  supported: {},
  icon: 'icon.svg',
  metadata: {
    address: '0x001',
    description: 'Dead token',
    website: 'dead.com',
    localization: {},
  },
};

export const createMockToken = (overwrites: Partial<Token> = {}) => ({
  ...DEFAULT_TOKEN,
  ...overwrites,
});
