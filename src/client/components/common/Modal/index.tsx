import { FC } from 'react';
import styled from 'styled-components';
import { Icon, CloseIcon } from '@components/common/Icon';

export interface ModalProps {
  className?: string;
  closeModal?: () => void;
}

const StyledModal = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overflow-y: auto;
  padding: 3rem;
  background: ${({ theme }) => theme.colors.surface};
  position: relative;
  pointer-events: all;
  z-index: 1;
  width: 32rem;
  height: 32rem;
  max-width: 80%;
  max-height: 80%;
`;

const CloseModal = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  position: absolute;
  right: 1rem;
  top: 1rem;
  cursor: pointer;
  transition: opacity 200ms ease-in-out;

  :hover {
    opacity: 0.8;
  }
`;

export const Modal: FC<ModalProps> = ({ className, closeModal, children, ...props }) => {
  let closeButton;

  if (closeModal) {
    closeButton = (
      <CloseModal onClick={closeModal}>
        <Icon Component={CloseIcon} />
      </CloseModal>
    );
  }
  return (
    <StyledModal className={className} {...props}>
      {closeButton}
      {children}
    </StyledModal>
  );
};
