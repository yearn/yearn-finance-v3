import { FC } from 'react';
import styled from 'styled-components';
import { Modal } from '@components/common';

const StyledTestModal = styled(Modal)`
  width: 38.5rem;
`;
export interface TestModalProps {
  onClose: () => void;
  modalProps: {
    testVar: string;
  };
}

export const TestModal: FC<TestModalProps> = ({ onClose, modalProps, ...props }) => {
  return (
    <StyledTestModal {...props} onClose={onClose}>
      Test modal
      <p>{modalProps.testVar}</p>
    </StyledTestModal>
  );
};
