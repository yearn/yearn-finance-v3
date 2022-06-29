import { FC } from 'react';

import { useAppTranslation } from '@hooks';
import { ModalTx } from '@components/common';
import { StakeTx } from '@components/app';

export interface GaugeStakeTxModalProps {
  onClose: () => void;
}

export const GaugeStakeTxModal: FC<GaugeStakeTxModalProps> = ({ onClose, ...props }) => {
  const { t } = useAppTranslation('common');
  return (
    <ModalTx {...props}>
      <StakeTx header={t('components.transaction.stake')} onClose={onClose} />
    </ModalTx>
  );
};
