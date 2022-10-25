import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { useAppTranslation } from '@hooks';
import { DeployLineTx } from '@src/client/components/app/Transactions/DeployLineTx';

const StyledDeployLineTxModal = styled(ModalTx)`
  width: '30%';
`;
export interface DeployLineTxModalProps {
  onClose: () => void;
}

export const DeployLineTxModal: FC<DeployLineTxModalProps> = ({ onClose, ...props }) => {
  console.log('deploy modal', props);
  const { t } = useAppTranslation('common');

  const onPositionChange = () => {
    // update deposit params
  };

  return (
    <StyledDeployLineTxModal {...props}>
      <DeployLineTx
        header={t('components.transaction.deploy-line.header')} // TODO
        onClose={onClose}
        onPositionChange={onPositionChange}
      />
    </StyledDeployLineTxModal>
  );
};
