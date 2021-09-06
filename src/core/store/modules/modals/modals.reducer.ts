import { createReducer } from '@reduxjs/toolkit';
import { ModalsState } from '@types';
import { ModalsActions } from './modals.actions';

export const modalsInitialState: ModalsState = {
  activeModal: '',
  modalProps: {},
};

const { openModal, closeModal } = ModalsActions;

const modalsReducer = createReducer(modalsInitialState, (builder) => {
  builder.addCase(openModal, (state, { payload: { modalName, modalProps } }) => {
    state.activeModal = modalName;
    state.modalProps = modalProps || {};

    // // TODO Move scroll lock into the actions or an effect watcher in react component
    document.body.style.top = `-${window.scrollY}px`;
    document.body.style.position = 'fixed';
  });
  builder.addCase(closeModal, (state) => {
    state.activeModal = '';
    state.modalProps = {};

    // TODO Move scroll lock into the actions or an effect watcher in react component
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  });
});

export default modalsReducer;
