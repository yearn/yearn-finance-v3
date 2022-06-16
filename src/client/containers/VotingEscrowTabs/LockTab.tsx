import { useState } from 'react';

import { AmountInput } from '@components/app';
import { Box, Text, Button } from '@components/common';

export const LockTab = () => {
  const [lockAmount, setLockAmount] = useState('');
  const [lockTime, setLockTime] = useState('');

  const resultAmount = lockAmount;

  return (
    <Box display="flex">
      <Box width={1 / 2}>
        <Text heading="h2">Lock YFI into veYFI</Text>
        <Text>Description goes here</Text>
      </Box>
      <Box width={1 / 2}>
        <Box mt="0.8rem">
          <Text heading="h3">Locking</Text>
          <Box display="flex" gap="1.6rem">
            <AmountInput
              label="YFI"
              amount={lockAmount}
              onAmountChange={setLockAmount}
              maxAmount="5"
              message="Available: 5 YFI"
              mt="1.6rem"
              width={1 / 2}
            />
            <AmountInput
              label="Lock time (weeks)"
              amount={lockTime}
              onAmountChange={setLockTime}
              maxAmount="208"
              message="min 1"
              mt="1.6rem"
              width={1 / 2}
            />
          </Box>
          <Box display="flex" alignItems="center" gap="1.6rem">
            <AmountInput
              label="veYFI you get"
              amount={resultAmount}
              message="min 1"
              mt="1.6rem"
              width={1 / 2}
              disabled
            />
            <Button filled width={1 / 2} height="5.6rem" mt="1.6rem">
              Lock
            </Button>
          </Box>
        </Box>
        <Box mt="2.4rem">
          <Text heading="h3">Auto-re-lock</Text>
          <Box display="flex" alignItems="center" gap="1.6rem">
            <AmountInput placeholder="Status" mt="1.6rem" width={1 / 2} disabled />
            <Button filled width={1 / 2} height="5.6rem" mt="1.6rem">
              Turn On
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
