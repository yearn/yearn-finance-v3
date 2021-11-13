import styled from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { useAppSelector, useAppDispatch } from '@hooks';
import { ModalsActions, ModalSelectors } from '@store';

import { TestModal } from './TestModal';
import { ComingSoonModal } from './ComingSoonModal';
import { TestTxModal } from './TestTxModal';
import { DepositTxModal } from './DepositTxModal';
import { WithdrawTxModal } from './WithdrawTxModal';
import { MigrateTxModal } from './MigrateTxModal';
import { BackscratcherLockTxModal, BackscratcherClaimTxModal, BackscratcherReinvestTxModal } from './Backscratcher';
import { LabDepositTxModal } from './LabDepositTxModal';
import { LabWithdrawTxModal } from './LabWithdrawTxModal';
import { LabStakeTxModal } from './LabStakeTxModal';
import {
  IronBankSupplyTxModal,
  IronBankWithdrawTxModal,
  IronBankBorrowTxModal,
  IronBankRepayTxModal,
} from './IronBank';

const modalTimeout = 300;

const StyledModals = styled(TransitionGroup)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: ${({ theme }) => theme.zindex.modals};

  .slideBottom-enter {
    opacity: 0;
    transform: translate3d(0, 100vh, 0);
    transition: opacity ${modalTimeout}ms ease, transform ${modalTimeout}ms ease;
  }
  .slideBottom-enter-active {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
  .slideBottom-exit-active {
    opacity: 0;
    transform: translate3d(0, 100vh, 0);
    transition: opacity ${modalTimeout}ms ease, transform ${modalTimeout}ms cubic-bezier(1, 0.5, 0.8, 1);
  }

  .opacity-enter {
    opacity: 0;
    transition: opacity ${modalTimeout}ms ease-in-out;
  }
  .opacity-enter-active {
    opacity: 1;
  }
  .opacity-exit-active {
    opacity: 0;
    transition: opacity ${modalTimeout}ms ease-in-out;
  }
`;

const StyledBackdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  pointer-events: all;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 0;

  @media (min-width: ${({ theme }) => theme.devices.tablet}px) {
    backdrop-filter: blur(11px);
  }
`;

// TODO dynamic modals list
// This will fix the development warning for strict mode if we apply nodeRef like
// in alerts
// const MODALS = [
//   {
//     name: 'test',
//     component: TestModal,
//   },
// ];

interface BackdropProps {
  onClick?: () => void;
}

export const Backdrop = ({ onClick }: BackdropProps) => {
  return <StyledBackdrop onClick={onClick} />;
};

export const Modals = () => {
  const dispatch = useAppDispatch();
  const activeModal = useAppSelector(ModalSelectors.selectActiveModal);
  const modalProps = useAppSelector(ModalSelectors.selectActiveModalProps);

  const closeModal = () => dispatch(ModalsActions.closeModal());

  let backdrop;

  if (activeModal) {
    backdrop = <Backdrop onClick={closeModal} />;
  }

  return (
    <StyledModals>
      {activeModal === 'test' && (
        <CSSTransition key={'test'} timeout={modalTimeout} classNames="slideBottom">
          <TestModal modalProps={modalProps} onClose={closeModal} />
        </CSSTransition>
      )}
      {activeModal === 'comingSoon' && (
        <CSSTransition key={'comingSoon'} timeout={modalTimeout} classNames="slideBottom">
          <ComingSoonModal modalProps={modalProps} onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'testTx' && (
        <CSSTransition key={'testTx'} timeout={modalTimeout} classNames="slideBottom">
          <TestTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'depositTx' && (
        <CSSTransition key={'depositTx'} timeout={modalTimeout} classNames="slideBottom">
          <DepositTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'withdrawTx' && (
        <CSSTransition key={'withdrawTx'} timeout={modalTimeout} classNames="slideBottom">
          <WithdrawTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'migrateTx' && (
        <CSSTransition key={'migrateTx'} timeout={modalTimeout} classNames="slideBottom">
          <MigrateTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'backscratcherLockTx' && (
        <CSSTransition key={'backscratcherLockTx'} timeout={modalTimeout} classNames="slideBottom">
          <BackscratcherLockTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'backscratcherClaimTx' && (
        <CSSTransition key={'backscratcherClaimTx'} timeout={modalTimeout} classNames="slideBottom">
          <BackscratcherClaimTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'backscratcherReinvestTx' && (
        <CSSTransition key={'backscratcherReinvestTx'} timeout={modalTimeout} classNames="slideBottom">
          <BackscratcherReinvestTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'labDepositTx' && (
        <CSSTransition key={'labDepositTx'} timeout={modalTimeout} classNames="slideBottom">
          <LabDepositTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'labWithdrawTx' && (
        <CSSTransition key={'labWithdrawTx'} timeout={modalTimeout} classNames="slideBottom">
          <LabWithdrawTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'labStakeTx' && (
        <CSSTransition key={'labStakeTx'} timeout={modalTimeout} classNames="slideBottom">
          <LabStakeTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'IronBankSupplyTx' && (
        <CSSTransition key={'IronBankSupplyTx'} timeout={modalTimeout} classNames="slideBottom">
          <IronBankSupplyTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'IronBankWithdrawTx' && (
        <CSSTransition key={'IronBankWithdrawTx'} timeout={modalTimeout} classNames="slideBottom">
          <IronBankWithdrawTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'IronBankBorrowTx' && (
        <CSSTransition key={'IronBankBorrowTx'} timeout={modalTimeout} classNames="slideBottom">
          <IronBankBorrowTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'IronBankRepayTx' && (
        <CSSTransition key={'IronBankRepayTx'} timeout={modalTimeout} classNames="slideBottom">
          <IronBankRepayTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {backdrop && (
        <CSSTransition key={'backdrop'} timeout={modalTimeout} classNames="opacity">
          {backdrop}
        </CSSTransition>
      )}
    </StyledModals>
  );
};
