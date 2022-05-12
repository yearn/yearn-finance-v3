import { createAction } from '@reduxjs/toolkit';

import { Address, PartnerId } from '@types';

interface ChangePartnerProps {
  id: PartnerId;
  address: Address;
}

const changePartner = createAction<ChangePartnerProps>('partner/changePartner');

export const PartnerActions = {
  changePartner,
};
