import { RootState } from '@types';

const selectActiveModal = (state: RootState) => state.modals.activeModal;

export const ModalSelectors = {
  selectActiveModal,
};
