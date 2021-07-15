import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from '@hooks';
import { ModalsActions, ModalSelectors } from '@core/store';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { TestModal } from './TestModal';
import { ComingSoonModal } from './ComingSoonModal';
// import { DepositModal } from './DepositModal_old';
// import { WithdrawModal } from './WithdrawModal_old';

import { TestTxModal } from './TestTxModal';
import { DepositTxModal } from './DepositTxModal';
import { WithdrawTxModal } from './WithdrawTxModal';
import { BackscratcherLockTxModal, BackscratcherClaimTxModal, BackscratcherReinvestTxModal } from './Backscratcher';
import { LabDepositTxModal } from './LabDepositTxModal';
import { LabWithdrawTxModal } from './LabWithdrawTxModal';
import { LabStakeTxModal } from './LabStakeTxModal';

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

      {/* {activeModal === 'deposit' && (
        <CSSTransition key={'deposit'} timeout={modalTimeout} classNames="slideBottom">
          <DepositModal onClose={closeModal} />
        </CSSTransition>
      )}
      {activeModal === 'withdraw' && (
        <CSSTransition key={'withdraw'} timeout={modalTimeout} classNames="slideBottom">
          <WithdrawModal onClose={closeModal} />
        </CSSTransition>
      )} */}

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

      {activeModal === 'backscratcherLockTx' && (
        <CSSTransition key={'backscratcherLockTx'} timeout={modalTimeout} classNames="slideBottom">
          <BackscratcherLockTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'backscratcherClaimTx' && (
        <CSSTransition key={'backscratcherClaimTx'} timeout={500} classNames="slideBottom">
          <BackscratcherClaimTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'backscratcherReinvestTx' && (
        <CSSTransition key={'backscratcherReinvestTx'} timeout={500} classNames="slideBottom">
          <BackscratcherReinvestTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'labDepositTx' && (
        <CSSTransition key={'labDepositTx'} timeout={500} classNames="slideBottom">
          <LabDepositTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'labWithdrawTx' && (
        <CSSTransition key={'labWithdrawTx'} timeout={500} classNames="slideBottom">
          <LabWithdrawTxModal onClose={closeModal} />
        </CSSTransition>
      )}

      {activeModal === 'labStakeTx' && (
        <CSSTransition key={'labStakeTx'} timeout={500} classNames="slideBottom">
          <LabStakeTxModal onClose={closeModal} />
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
