import { useState } from 'react';

import { useAppSelector, useAppDispatch } from '@hooks';
import { VotingEscrowsActions, VotingEscrowsSelectors, WalletSelectors } from '@store';
import { AmountInput } from '@components/app';
import { Box, Text, Button } from '@components/common';
import { humanize, toBN, weeksBetween } from '@utils';

export const EarlyExitTab = () => {
  const dispatch = useAppDispatch();
  const [isExiting, setIsExiting] = useState(false);
  const isWalletConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);

  const hasLockedAmount = !!votingEscrow?.earlyExitPenaltyRatio && toBN(votingEscrow?.DEPOSIT.userDeposited).gt(0);
  const weeksToUnlock = votingEscrow?.unlockDate ? weeksBetween(new Date(), votingEscrow.unlockDate).toString() : '0';
  const expectedTokens = hasLockedAmount
    ? toBN(votingEscrow?.DEPOSIT.userDeposited)
        .times(votingEscrow?.earlyExitPenaltyRatio ?? 0)
        .toString()
    : '0';

  const earlyExit = async () => {
    if (!votingEscrow) return;
    setIsExiting(true);
    await dispatch(
      VotingEscrowsActions.withdrawLocked({
        tokenAddress: votingEscrow.token.address,
        votingEscrowAddress: votingEscrow.address,
      })
    );
    setIsExiting(false);
  };

  const txAction = {
    label: 'Exit',
    onAction: earlyExit,
    status: isExiting,
    disabled: !hasLockedAmount,
  };

  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))">
      <Box>
        <Text heading="h2">Early exit</Text>
        <Text>Description goes here</Text>
      </Box>
      <Box>
        <Box mt="0.8rem">
          <Box display="flex" gap="1.6rem">
            <AmountInput
              label="veYFI you have"
              amount={humanize('amount', votingEscrow?.DEPOSIT.userBalance, votingEscrow?.decimals, 4)}
              mt="1.6rem"
              width={1 / 2}
              disabled
            />
            <AmountInput label="Current lock time (weeks)" amount={weeksToUnlock} mt="1.6rem" width={1 / 2} disabled />
          </Box>
          <Box display="flex" alignItems="center" gap="1.6rem">
            <AmountInput
              label="veYFI you get"
              amount={humanize('amount', expectedTokens, votingEscrow?.token.decimals, 4)}
              message={`Penalty: ${humanize('percent', votingEscrow?.earlyExitPenaltyRatio?.toString(), undefined, 0)}`}
              mt="1.6rem"
              width={1 / 2}
              disabled
            />
            <Button
              onClick={txAction.onAction}
              disabled={txAction.disabled}
              filled
              width={1 / 2}
              height="5.6rem"
              mt="1.6rem"
            >
              {txAction.label}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
