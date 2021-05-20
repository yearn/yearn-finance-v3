import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from '@hooks';
import { ModalsActions } from '@core/store';

import { TestModal } from './TestModal';

const StyledModals = styled.div`
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
`;

// TODO dynamic modals list
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
  const activeModal = useAppSelector(({ modals }) => modals.activeModal);

  const closeModal = () => dispatch(ModalsActions.closeModal());

  let backdrop;

  if (activeModal) {
    backdrop = <Backdrop onClick={closeModal} />;
  }
  return (
    <StyledModals>
      {activeModal === 'test' && <TestModal closeModal={closeModal} />}

      {backdrop}
    </StyledModals>
  );
};
