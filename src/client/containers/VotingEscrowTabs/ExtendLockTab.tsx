import { useState } from 'react';

import { AmountInput } from '@components/app';
import { Box, Text, Button } from '@components/common';

export const ExtendLockTab = () => {
  const [lockTime, setLockTime] = useState('');

  const currentLockTime = '69';
  const resultAmount = '5';

  return (
    <Box display="flex">
      <Box width={1 / 2}>
        <Text heading="h2">Extend lock</Text>
        <Text>Description goes here</Text>
      </Box>
      <Box width={1 / 2}>
        <Box mt="0.8rem">
          <Box display="flex" gap="1.6rem">
            <AmountInput
              label="Current time"
              amount={currentLockTime}
              message="42 left"
              mt="1.6rem"
              width={1 / 2}
              disabled
            />
            <AmountInput
              label="Increase lock time (weeks)"
              amount={lockTime}
              onAmountChange={setLockTime}
              maxAmount="42"
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
              Extend
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
