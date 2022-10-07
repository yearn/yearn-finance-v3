import { BigNumber } from 'ethers';

import { Address } from './Blockchain';
import { Status } from './Status';

export interface LineServices {
  deploySecuredLine(arg0: { borrower: string; ttl: string; network: string }): unknown;
  // TODO: beef up this type so it has everything we need for homepage cards
  // TODO: replace BaseCreditLine with CreditLine in State.CreditLine and actinos/selectors
  id: Address;
  end: number;
  start: number;
  type?: string;
  status: string;
  borrower: Address;

  principal?: number;
  activeIds: string[];

  escrow?: { id: Address };
  spigot?: { id: Address };
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
