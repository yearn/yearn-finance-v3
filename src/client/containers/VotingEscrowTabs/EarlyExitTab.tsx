import { AmountInput } from '@components/app';
import { Box, Text, Button } from '@components/common';

export const EarlyExitTab = () => {
  const lockedAmount = '42';
  const currentLockTime = '69';
  const resultAmount = '24';

  return (
    <Box display="flex">
      <Box width={1 / 2}>
        <Text heading="h2">Early exit</Text>
        <Text>Description goes here</Text>
      </Box>
      <Box width={1 / 2}>
        <Box mt="0.8rem">
          <Box display="flex" gap="1.6rem">
            <AmountInput label="veYFI you have" amount={lockedAmount} mt="1.6rem" width={1 / 2} disabled />
            <AmountInput
              label="Current lock time (weeks)"
              amount={currentLockTime}
              mt="1.6rem"
              width={1 / 2}
              disabled
            />
          </Box>
          <Box display="flex" alignItems="center" gap="1.6rem">
            <AmountInput
              label="veYFI you get"
              amount={resultAmount}
              message="Penalty: 50%"
              mt="1.6rem"
              width={1 / 2}
              disabled
            />
            <Button filled width={1 / 2} height="5.6rem" mt="1.6rem">
              Exit
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
