import { FC } from 'react';
import styled from 'styled-components';

import { ProgressBar, Text } from '@components/common';
import { toBN, formatAmount, formatUsd, formatPercent } from '@utils';

const StyledText = styled(Text)`
  color: ${({ theme }) => theme.colors.txModalColors.text};
`;

const Info = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const StyledTxBorrowLimit = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
  min-height: 15.6rem;
  width: 100%;
  border-radius: ${({ theme }) => theme.globalRadius};
  padding: ${({ theme }) => theme.txModal.gap};
  gap: 0.8rem;
`;

export interface TxBorrowLimitProps {
  borrowBalance: string;
  projectedBorrowBalance?: string;
  borrowLimit: string;
  projectedBorrowLimit?: string;
  yieldLabel: string;
  yieldPercent: string;
  borrowingTokens?: string;
  projectedBorrowingTokens?: string;
  tokenSymbol?: string;
}

export const TxBorrowLimit: FC<TxBorrowLimitProps> = ({
  borrowBalance,
  projectedBorrowBalance,
  borrowLimit,
  projectedBorrowLimit,
  yieldLabel,
  yieldPercent,
  borrowingTokens,
  projectedBorrowingTokens,
  tokenSymbol,
}) => {
  if (!projectedBorrowBalance) projectedBorrowBalance = borrowBalance;
  if (!projectedBorrowLimit) projectedBorrowLimit = borrowLimit;

  const borrowRatio = toBN(borrowLimit).eq(0) ? '0' : toBN(borrowBalance).div(borrowLimit).toString();
  const projectedBorrowRatio = toBN(projectedBorrowLimit).eq(0)
    ? '0'
    : toBN(projectedBorrowBalance).div(projectedBorrowLimit).toString();

  const limitUsedPercent = toBN(borrowBalance).div(borrowLimit).times(100).toNumber();
  const projectedLimitUsedPercent = toBN(projectedBorrowBalance).div(projectedBorrowLimit).times(100).toNumber();

  return (
    <StyledTxBorrowLimit>
      <Info>
        <StyledText>Total Borrow Limit</StyledText>
        <StyledText>
          {formatUsd(borrowLimit)}
          {borrowLimit !== projectedBorrowLimit && <>{` → ${formatUsd(projectedBorrowLimit)}`}</>}
        </StyledText>
      </Info>

      <Info>
        <StyledText>Total Borrow Limit Used</StyledText>
        <StyledText>
          {formatPercent(borrowRatio, 0)}
          {formatPercent(borrowRatio, 0) !== formatPercent(projectedBorrowRatio, 0) && (
            <>{` → ${formatPercent(projectedBorrowRatio, 0)}`}</>
          )}
        </StyledText>
      </Info>

      <ProgressBar value={limitUsedPercent} diffValue={projectedLimitUsedPercent} />

      {borrowingTokens && (
        <Info>
          <StyledText>Borrowing</StyledText>
          <StyledText>{`${formatAmount(projectedBorrowingTokens ?? borrowingTokens, 4)} ${tokenSymbol}`}</StyledText>
        </Info>
      )}

      <Info>
        <StyledText>{yieldLabel}</StyledText>
        <StyledText>{yieldPercent}</StyledText>
      </Info>
    </StyledTxBorrowLimit>
  );
};
