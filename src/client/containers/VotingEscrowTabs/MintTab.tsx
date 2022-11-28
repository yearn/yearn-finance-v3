import { useState } from 'react';

import { useAppSelector, useExecuteThunk } from '@hooks';
import { AlertsActions, VotingEscrowsActions, VotingEscrowsSelectors } from '@store';
import { AmountInput } from '@components/app';
import { Box, Text, Button } from '@components/common';
import { humanize } from '@utils';

export const MintTab = () => {
  const [amount, setAmount] = useState('');
  const [openAlert] = useExecuteThunk(AlertsActions.openAlert);
  const displayWarning = (error: any) => openAlert({ message: error.message, type: 'warning' });
  const [mint, mintStatus] = useExecuteThunk(VotingEscrowsActions.mint, displayWarning);
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);

  const executeMint = async () => {
    if (!votingEscrow) return;
    mint({
      tokenAddress: votingEscrow.token.address,
      amount,
    });
  };

  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
      minHeight="35rem"
      p={['2rem', '3.2rem']}
      width={1}
    >
      <Box>
        <Text heading="h2">Mint Test YFI</Text>
        <Text>Tab added just for testing</Text>
      </Box>
      <Box>
        <Box mt="0.8rem">
          <Text heading="h3">Mint</Text>
          <Box display="flex" flexDirection={['column', 'column', 'row']} alignItems="center" gap="2.4rem">
            <AmountInput
              label={`${votingEscrow?.token.symbol ?? 'YFI'}`}
              amount={amount}
              onAmountChange={setAmount}
              message={`Available: ${humanize(
                'amount',
                votingEscrow?.token.balance,
                votingEscrow?.token.decimals,
                4
              )} ${votingEscrow?.token.symbol ?? 'YFI'}`}
              mt="1.6rem"
              width={[1, 1, 1 / 2]}
            />
            <Button
              onClick={executeMint}
              isLoading={mintStatus.loading}
              success={mintStatus.executed && !mintStatus.error}
              filled
              rounded={false}
              mt={['0rem', '0rem', '1.8rem']}
              width={[1, 1, 1 / 2]}
              height="4rem"
            >
              Mint
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
