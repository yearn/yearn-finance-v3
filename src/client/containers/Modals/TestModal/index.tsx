import { FC } from 'react';
import styled from 'styled-components';
import { Modal } from '@components/common';

const StyledTestModal = styled(Modal)`
  width: 38.5rem;
`;

interface TestModalProps {
  onClose: () => void;
}

export const TestModal: FC<TestModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledTestModal {...props} onClose={onClose}>
      Test modal
    </StyledTestModal>
  );
};
