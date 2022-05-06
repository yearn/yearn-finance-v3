import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { ModalTx } from '@components/common';
import { DepositTx } from '@components/app';

const StyledDepositTxModal = styled(ModalTx)``;
export interface DepositTxModalProps {
  onClose: () => void;
  modalProps?: {
    allowTokenSelect: boolean;
    allowVaultSelect: boolean;
  };
}

export const DepositTxModal: FC<DepositTxModalProps> = ({
  onClose,
  modalProps = { allowTokenSelect: true, allowVaultSelect: false },
  ...props
}) => {
  const { t } = useAppTranslation('common');
  return (
    <StyledDepositTxModal {...props}>
      <DepositTx
        header={t('components.transaction.deposit')}
        allowTokenSelect={modalProps.allowTokenSelect}
        allowVaultSelect={modalProps.allowVaultSelect}
        onClose={onClose}
      />
    </StyledDepositTxModal>
  );
};
