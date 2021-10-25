import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { ModalTx } from '@components/common';
import { WithdrawTx } from '@components/app/Transactions';

const StyledWithdrawTxModal = styled(ModalTx)``;
export interface WithdrawTxModalProps {
  onClose: () => void;
}

export const WithdrawTxModal: FC<WithdrawTxModalProps> = ({ onClose, ...props }) => {
  const { t } = useAppTranslation('common');

  return (
    <StyledWithdrawTxModal {...props}>
      <WithdrawTx header={t('components.transaction.withdraw')} onClose={onClose} />
    </StyledWithdrawTxModal>
  );
};
