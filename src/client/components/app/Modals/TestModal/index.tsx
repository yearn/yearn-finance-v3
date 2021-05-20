import { FC } from 'react';
import styled from 'styled-components';
import { Modal } from '@components/common';

const StyledTestModal = styled(Modal)`
  width: 38.5rem;
`;

interface TestModalProps {
  closeModal: () => void;
}

export const TestModal: FC<TestModalProps> = ({ closeModal, ...props }) => {
  return (
    <StyledTestModal {...props} closeModal={closeModal}>
      Test modal
    </StyledTestModal>
  );
};
