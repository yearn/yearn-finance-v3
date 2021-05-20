import { createAction } from '@reduxjs/toolkit';

const openModal = createAction<{ modalName: string }>('modals/openModal');
const closeModal = createAction('modals/closeModal');

export const ModalsActions = {
  openModal,
  closeModal,
};
