import { FC } from 'react';
import styled from 'styled-components';

import { Icon, CloseIcon } from '../Icon';

const StyledModal = styled.div`
  overflow: hidden;
  overflow-y: auto;
  padding: 1.6rem;
  background: ${({ theme }) => theme.colors.txModalColors.background};
  color: ${({ theme }) => theme.colors.txModalColors.textContrast};
  position: relative;
  pointer-events: all;
  z-index: 1;
  width: 32rem;
  height: 32rem;
  max-width: 85%;
  max-height: 85%;
`;

const CloseModal = styled.div`
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

export interface ModalProps {
  className?: string;
  onClose?: () => void;
}

export const Modal: FC<ModalProps> = ({ className, onClose, children, ...props }) => {
  let closeButton;

  if (onClose) {
    closeButton = (
      <CloseModal onClick={onClose}>
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
