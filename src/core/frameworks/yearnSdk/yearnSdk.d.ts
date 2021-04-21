import '@yfi/sdk';
import { Asset, Position } from '@yfi/sdk';

declare module '@yfi/sdk' {
  export interface Yearn {
    ironBank: {
      get: () => Promise<Asset<any>[]>;
      positionsOf: (address: Address) => Promise<PositionsWithMetadata[]>;
    };
  }

  export interface PositionsWithMetadata {
    positions: Position[];
    metadata: any;
  }
}
