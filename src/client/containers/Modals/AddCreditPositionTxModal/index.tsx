import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation, useSelectedCreditLine } from '@hooks';
import { ModalTx } from '@components/common';
import { AddCreditPositionTx } from '@components/app';
import { TokenView } from '@core/types';

const StyledAddCreditPositionTxModal = styled(ModalTx)``;
export interface AddCreditPositionTxModalProps {
  onClose: () => void;
  modalProps?: {
    allowVaultSelect: boolean;
  };
}

export const AddCreditPositionTxModal: FC<AddCreditPositionTxModalProps> = ({
  onClose,
  modalProps = { allowVaultSelect: false },
  ...props
}) => {
  console.log('deposit modal', props);
  const { t } = useAppTranslation('common');
  const [creditLine, setSelected] = useSelectedCreditLine();
  // if (!creditLine) return; // TODO error or creditLine selector input

  const onSelectedCreditLineChange = () => {
    // new creditLine selected to invest in
    // setSelected()
  };

  const onPositionChange = () => {
    // update deposit params
  };

  return (
    <StyledAddCreditPositionTxModal {...props}>
      <AddCreditPositionTx
        header={t('components.transaction.add-credit.header')} // TODO
        acceptingOffer={false}
        allowVaultSelect={modalProps.allowVaultSelect}
        onClose={onClose}
        onSelectedCreditLineChange={onSelectedCreditLineChange}
        onPositionChange={onPositionChange}
      />
    </StyledAddCreditPositionTxModal>
  );
};
