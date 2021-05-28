import { createReducer } from '@reduxjs/toolkit';
import { ModalsState } from '@types';
import { ModalsActions } from './modals.actions';

const initialState: ModalsState = {
  activeModal: '',
  modalProps: {},
};

const { openModal, closeModal } = ModalsActions;

const modalsReducer = createReducer(initialState, (builder) => {
  builder.addCase(openModal, (state, { payload: { modalName, modalProps } }) => {
    state.activeModal = modalName;
    state.modalProps = modalProps || {};
  });
  builder.addCase(closeModal, (state) => {
    state.activeModal = '';
    state.modalProps = {};
  });
});

export default modalsReducer;
