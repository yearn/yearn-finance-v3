import { Vault, Position, TokenPriced } from '@yfi/sdk';
// import { BigNumber } from '@frameworks/ethers';

const tokens = {
  supported: (): TokenPriced[] => {
    console.log('Mock: tokens.supported()');
    throw Error('Not implmented');
  },
  //   dynamicData: () => {
  //     console.log('Mock: tokens.dynamicData()');
  //   },
};

const vaults = {
  get: (): Promise<Vault[]> => {
    console.log('Mock: vaults.get()');
    throw Error('Not implmented');
  },
  positionsOf: (): Promise<Position[]> => {
    console.log('Mock: vaults.positionOf()');
    throw Error('Not implmented');
  },
};

const ironBank = {
  get: () => {
    console.log('Mock: ironBank.get()');
  },
  positionsOf: () => {
    console.log('Mock: ironBank.positionOf()');
  },
};

export const yearnSdkMock = {
  tokens,
  vaults,
  ironBank,
};
