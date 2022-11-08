import { BigNumber } from 'ethers';

import { Address } from './Blockchain';
import { Status } from './Status';

export interface LineFactoryService {
  deploySecuredLine(arg0: { borrower: string; ttl: string; network: string }): unknown;
}

// Transaction data

export interface deploySecuredLine {
  oracle: Address;
  arbiter: Address;
  factoryAddress: Address;
  swapTarget: Address;
  borrower: Address;
  ttl: number;
}
