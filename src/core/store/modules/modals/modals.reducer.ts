import { createReducer } from '@reduxjs/toolkit';
import { ModalsState } from '@types';
import { ModalsActions } from './modals.actions';

const initialState: ModalsState = {
  activeModal: '',
};

const { openModal, closeModal } = ModalsActions;

const modalsReducer = createReducer(initialState, (builder) => {
  builder.addCase(openModal, (state, { payload: { modalName } }) => {
    state.activeModal = modalName;
  });
  builder.addCase(closeModal, (state) => {
    state.activeModal = '';
  });
});

export default modalsReducer;
