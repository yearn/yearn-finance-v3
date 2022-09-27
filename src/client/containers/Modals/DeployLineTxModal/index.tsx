import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { useAppTranslation } from '@hooks';
import { DeployLineTx } from '@src/client/components/app/Transactions/DeployLineTx';

const StyledDeployLineTxModal = styled(ModalTx)``;
export interface DeployLineTxModalProps {
  onClose: () => void;
  modalProps?: {
    allowVaultSelect: boolean;
  };
}

export const DeployLineTxModal: FC<DeployLineTxModalProps> = ({
  onClose,
  modalProps = { allowVaultSelect: false },
  ...props
}) => {
  console.log('deploy modal', props);
  const { t } = useAppTranslation('common');

  const onPositionChange = () => {
    // update deposit params
  };

  return (
    <StyledDeployLineTxModal {...props}>
      <DeployLineTx
        header={t('components.transaction.add-credit.header')} // TODO
        allowVaultSelect={modalProps.allowVaultSelect}
        onClose={onClose}
        onPositionChange={onPositionChange}
      />
    </StyledDeployLineTxModal>
  );
};
