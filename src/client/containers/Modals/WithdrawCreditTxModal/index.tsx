import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { ModalTx } from '@components/common';
import { WithdrawCreditTx } from '@components/app';

const StyledWithdrawTxModal = styled(ModalTx)``;
export interface WithdrawTxModalProps {
  onClose: () => void;
}

export const WithdrawCreditTxModal: FC<WithdrawTxModalProps> = ({ onClose, ...props }) => {
  const { t } = useAppTranslation('common');

  const onSelectedCreditLineChange = () => {
    // new creditLine selected to invest in
    // setSelected()
  };

  const onPositionChange = () => {
    // update deposit params
  };

  return (
    <StyledWithdrawTxModal {...props}>
      <WithdrawCreditTx
        header={t('components.transaction.withdraw')}
        onSelectedCreditLineChange={onSelectedCreditLineChange}
        onPositionChange={onPositionChange}
        onClose={onClose}
      />
    </StyledWithdrawTxModal>
  );
};
