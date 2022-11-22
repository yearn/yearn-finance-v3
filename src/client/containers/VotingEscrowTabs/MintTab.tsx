import { useState } from 'react';

import { useAppSelector, useExecuteThunk } from '@hooks';
import { VotingEscrowsActions, VotingEscrowsSelectors, WalletSelectors } from '@store';
import { AmountInput, TxError } from '@components/app';
import { Box, Text, Button } from '@components/common';
import { humanize, toUnit, validateNetwork } from '@utils';
import { getConfig } from '@config';

export const MintTab = () => {
  const { NETWORK } = getConfig();
  const [amount, setAmount] = useState('');
  const [mint, mintStatus] = useExecuteThunk(VotingEscrowsActions.mint);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);

  const { error: networkError } = validateNetwork({
    currentNetwork: NETWORK,
    walletNetwork,
  });

  const error = networkError || mintStatus.error;

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
      p={['1.6rem', '1.6rem', '2.4rem']}
      width={1}
    >
      <Box>
        <Text heading="h2">Mint Test YFI</Text>
        <Text>Tab added just for testing</Text>
      </Box>
      <Box>
        <Box mt="0.8rem">
          <Text heading="h3">Mint</Text>
          <Box display="flex" flexDirection={['column', 'column', 'row']} alignItems="center" gap="1.6rem">
            <AmountInput
              label={`${votingEscrow?.token.symbol ?? 'YFI'}`}
              amount={amount}
              onAmountChange={setAmount}
              maxAmount={votingEscrow ? toUnit(votingEscrow.token.balance, votingEscrow.token.decimals) : '0'}
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
              mt={['0rem', '0rem', '1.6rem']}
              width={[1, 1, 1 / 2]}
              height="5.6rem"
            >
              Mint
            </Button>
          </Box>
          {error && (
            <Box mt="1.6rem">
              <TxError errorType="warning" errorTitle={error} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
