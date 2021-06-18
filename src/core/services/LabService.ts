import {
  LabService,
  Web3Provider,
  YearnSdk,
  Position,
  GetUserLabsMetadataProps,
  GetUserLabsPositionsProps,
  Lab,
  LabDynamic,
  LabUserMetadata,
} from '@types';

export class LabServiceImpl implements LabService {
  private web3Provider: Web3Provider;

  constructor({ web3Provider, yearnSdk }: { web3Provider: Web3Provider; yearnSdk: YearnSdk }) {
    this.web3Provider = web3Provider;
  }

  public async getSupportedLabs(): Promise<Lab[]> {
    throw Error('Not Implemented');
  }

  public async getLabsDynamicData(): Promise<LabDynamic[]> {
    throw Error('Not Implemented');
  }

  public async getUserLabsPositions(props: GetUserLabsPositionsProps): Promise<Position[]> {
    throw Error('Not Implemented');
  }

  public async getUserLabsMetadata(props: GetUserLabsMetadataProps): Promise<LabUserMetadata[]> {
    throw Error('Not Implemented');
  }
}
