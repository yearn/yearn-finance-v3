import { AmountInput } from '@components/app';
import { Box, Text, Button } from '@components/common';

export const ClaimUnlockedTab = () => {
  const unlockedAmount = '42';

  return (
    <Box display="flex">
      <Box width={1 / 2}>
        <Text heading="h2">Extend lock</Text>
        <Text>Description goes here</Text>
      </Box>
      <Box width={1 / 2}>
        <Box mt="0.8rem">
          <Text heading="h3">Claiming</Text>
          <Box display="flex" alignItems="center" gap="1.6rem">
            <AmountInput label="Unlocked YFI" amount={unlockedAmount} mt="1.6rem" width={1 / 2} disabled />
            <Button filled width={1 / 2} height="5.6rem" mt="4rem">
              Claim
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
