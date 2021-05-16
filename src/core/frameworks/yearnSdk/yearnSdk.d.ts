import '@yfi/sdk';
import { Asset, Position } from '@types';

declare module '@yfi/sdk' {
  export interface Yearn {
    ironBank: {
      get: () => Promise<Asset<any>[]>;
      assetsPositionsOf: (address: Address) => Promise<PositionsWithMetadata[]>;
      getIronBank: (address: Address) => Promise<any>;
    };
  }

  export interface PositionsWithMetadata {
    positions: Position[];
    metadata: any;
  }
}
