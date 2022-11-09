import { createSelector } from '@reduxjs/toolkit';
import { memoize, find } from 'lodash';
import { getAddress } from '@ethersproject/address';

import {
  RootState,
  Status,
  LineActionsStatusMap,
  AggregatedCreditLine,
  Address,
  CreditLinePage,
  UserPositionMetadata,
  BORROWER_POSITION_ROLE,
  LENDER_POSITION_ROLE,
  ARBITER_POSITION_ROLE, // prev. GeneralVaultView, Super indepth data, CreditLinePage is most similar atm
} from '@types';
import { toBN, formatCreditEvents, formatCollateralEvents, unnullify } from '@utils';
import { getConstants } from '@src/config/constants';

import {} from './collateral.reducer';

const { ZERO_ADDRESS } = getConstants();

/* ---------------------------------- State --------------------------------- */
const selectUserWallet = (state: RootState) => state.wallet.selectedAddress;
/* ---------------------------------- Main Selector --------------------------------- */

const selectStatusMap = (state: RootState) => state.collateral.statusMap;
const selectSelectedEscrow = (state: RootState) => state.collateral.selectedEscrow;
const selectSelectedSpigot = (state: RootState) => state.collateral.selectedSpigot;
const selectSelectedCollateralToken = (state: RootState) => state.collateral.selectedCollateralToken;
const selectSelectedRevenueContract = (state: RootState) => state.collateral.selectedRevenueContract;

export const CollateralSelectors = {
  selectStatusMap,
  selectSelectedEscrow,
  selectSelectedSpigot,
  selectSelectedCollateralToken,
  selectSelectedRevenueContract,
};
