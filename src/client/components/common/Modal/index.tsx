import { FC } from 'react';
import styled from 'styled-components';

import { Icon, CloseIcon } from '../Icon';

const ModalHeader = styled.div`
  font-weight: bold;
  font-size: 1.8rem;
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

const StyledModal = styled.div`
  overflow: hidden;
  overflow-y: auto;
  padding: 2.6rem;
  background: ${({ theme }) => theme.colors.txModalColors.background};
  border-radius: ${({ theme }) => theme.globalRadius};
  color: ${({ theme }) => theme.colors.txModalColors.textContrast};
  position: relative;
  pointer-events: all;
  z-index: 1;
  width: 32rem;
  height: 32rem;
  max-width: 85%;
  max-height: 85%;
`;

export interface ModalProps {
  className?: string;
  header?: string;
  onClose?: () => void;
}

export const Modal: FC<ModalProps> = ({ className, header, onClose, children, ...props }) => {
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
      <ModalHeader>{header}</ModalHeader>

      {children}
    </StyledModal>
  );
};
