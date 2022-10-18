import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { useAppTranslation } from '@hooks';
import { LiquidateBorrowerTx } from '@src/client/components/app/Transactions/LiquidateBorrowerTx';

const StyledLiquidateBorrowerTxModal = styled(ModalTx)``;
export interface LiquidateBorrowerTxModalProps {
  onClose: () => void;
  modalProps?: {
    allowVaultSelect: boolean;
  };
}

export const LiquidateBorrowerTxModal: FC<LiquidateBorrowerTxModalProps> = ({
  onClose,
  modalProps = { allowVaultSelect: false },
  ...props
}) => {
  console.log('deploy modal', props);
  const { t } = useAppTranslation('common');
  // if (!creditLine) return; // TODO error or creditLine selector input

  const onSelectedCreditLineChange = () => {
    // new creditLine selected to invest in
    // setSelected()
  };

  const onPositionChange = () => {
    // update deposit params
  };

  return (
    <StyledLiquidateBorrowerTxModal {...props}>
      <LiquidateBorrowerTx
        header={t('components.transaction.arbiter-liquidate.header')} // TODO
        allowVaultSelect={modalProps.allowVaultSelect}
        onClose={onClose}
        onSelectedCreditLineChange={onSelectedCreditLineChange}
        onPositionChange={onPositionChange}
      />
    </StyledLiquidateBorrowerTxModal>
  );
};
