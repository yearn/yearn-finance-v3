import { FC } from 'react';
import { t } from 'i18next';

import { Box, Button, Dropdown } from '@components/common';
import { formatAmount } from '@utils';

import { AmountInput } from '../AmountInput';

import { TxContainer } from './components/TxContainer';

interface StakeTxProps {
  onClose?: () => void;
}

export const StakeTx: FC<StakeTxProps> = (props) => {
  const { onClose } = props;

  const DUMMY_TOKEN = {
    amount: '69.42424242',
    symbol: 'YFI',
  };

  const DUMMY_ITEM = {
    key: 'yvDAI',
    value: 'yvDAI',
  };

  const amountInputMessage = `${t('dashboard.available')}: ${formatAmount(DUMMY_TOKEN.amount, 8)} ${
    DUMMY_TOKEN.symbol
  }`;

  return (
    <TxContainer onClose={onClose} header={t('components.transaction.stake')}>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gridColumnGap={'2.4rem'}>
        <Dropdown
          label={'Choose token'} // TODO: Add translation
          selected={DUMMY_ITEM}
          items={[DUMMY_ITEM]}
          mt={'2.4rem'}
          fullWidth
        />

        <AmountInput
          label={'Amount'} // TODO: Add translation
          amount={'0'}
          onAmountChange={() => {}}
          maxAmount={DUMMY_TOKEN.amount}
          message={amountInputMessage}
          mt={'2.4rem'}
        />

        <Button onClick={() => {}} disabled={false} filled height={'5.6rem'} mt={'2.4rem'}>
          Approve
        </Button>

        <Button onClick={() => {}} disabled={true} filled height={'5.6rem'} mt={'2.4rem'}>
          Stake
        </Button>
      </Box>
    </TxContainer>
  );
};
