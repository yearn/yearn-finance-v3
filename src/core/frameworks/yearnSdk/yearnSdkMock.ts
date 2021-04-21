import { Vault, Position, TokenPriced } from '@yfi/sdk';
import { BigNumber } from '@frameworks/ethers';
import IronBankGetMockData from './mock/IronBankGetMockData.json';
import IronBankPositionMockData from './mock/IronBankPositionMockData.json';
import VaultsV2MockData from './mock/VaultsV2MockData.json';

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
  get: (): Vault[] => {
    console.log('Mock: vaults.get()');
    const staticVaultsData = VaultsV2MockData.static;
    const dynamicVaultsData = VaultsV2MockData.dynamic;

    const vaults: Vault[] = staticVaultsData.map((staticData, i) => {
      const dynamicData = dynamicVaultsData[i];

      return {
        id: staticData.id,
        typeId: 'VAULT_V2',
        name: staticData.name,
        version: staticData.version,
        token: {
          id: staticData.token.id,
          name: staticData.token.name,
          symbol: staticData.token.symbol,
          decimals: BigNumber.from(staticData.token.decimals),
        },
        tokenId: dynamicData.tokenId,
        underlyingTokenBalance: {
          amount: BigNumber.from(dynamicData.underlyingTokenBalance.amount),
          amountUsdc: BigNumber.from(dynamicData.underlyingTokenBalance.amountUsdc),
        },
        metadata: {
          symbol: dynamicData.metadata.symbol,
          pricePerShare: BigNumber.from(dynamicData.metadata.pricePerShare),
          migrationAvailable: dynamicData.metadata.migrationAvailable,
          latestVaultAddress: dynamicData.metadata.latestVaultAddress,
          depositLimit: BigNumber.from(dynamicData.metadata.depositLimit),
          emergencyShutdown: dynamicData.metadata.emergencyShutdown,
        },
      };
    });
    console.log({ vaults });

    return vaults;
  },
  positionsOf: (): Promise<Position[]> => {
    console.log('Mock: vaults.positionOf()');
    throw Error('Not implmented');
  },
};

const ironBank = {
  get: () => {
    console.log('Mock: ironBank.get()');
    return IronBankGetMockData.map((cyToken) => ({
      ...cyToken,
      underlyingTokenBalance: {
        amount: BigNumber.from(cyToken.underlyingTokenBalance.amount),
        amountUsdc: BigNumber.from(cyToken.underlyingTokenBalance.amountUsdc),
      },
      metadata: {
        ...cyToken.metadata,
        decimals: BigNumber.from(cyToken.metadata.decimals),
        liquidity: BigNumber.from(cyToken.metadata.liqudity),
      },
    }));
  },
  positionsOf: () => {
    console.log('Mock: ironBank.positionOf()');
    return IronBankPositionMockData.map((cyTokenPosition) => {
      const positions = cyTokenPosition.positions.map((position) => ({
        ...position,
        balance: BigNumber.from(position.balance),
        accountTokenBalance: {
          amount: BigNumber.from(position.accountTokenBalance.amount),
          amountUsdc: BigNumber.from(position.accountTokenBalance.amountUsdc),
        },
        underlyingTokenBalance: {
          amount: BigNumber.from(position.underlyingTokenBalance.amount),
          amountUsdc: BigNumber.from(position.underlyingTokenBalance.amountUsdc),
        },
      }));
      return {
        positions,
        metadata: {
          ...cyTokenPosition.metadata,
          borrowLimit: BigNumber.from(cyTokenPosition.metadata.borrowLimit),
        },
      };
    });
  },
};

export const yearnSdkMock = {
  tokens,
  vaults,
  ironBank,
};
