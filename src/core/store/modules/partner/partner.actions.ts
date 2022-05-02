import { createAction } from '@reduxjs/toolkit';

import { Address, PartnerId } from '@types';

const changePartner = createAction<{ partnerId: PartnerId; address: Address }>('partner/changePartner');

export const PartnerActions = {
  changePartner,
};
