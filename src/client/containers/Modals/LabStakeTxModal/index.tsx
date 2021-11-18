import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { LabStakeTx } from '@components/app';

const StyledLabStakeTxModal = styled(ModalTx)``;
export interface LabStakeTxModalProps {
  onClose: () => void;
}

export const LabStakeTxModal: FC<LabStakeTxModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledLabStakeTxModal {...props}>
      <LabStakeTx onClose={onClose} />
    </StyledLabStakeTxModal>
  );
};
