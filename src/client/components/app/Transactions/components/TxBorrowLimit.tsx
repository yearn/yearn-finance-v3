import { FC } from 'react';
import styled from 'styled-components';

import { ProgressBar, Text } from '@components/common';
import { toBN, formatUsd, formatPercent } from '@src/utils';

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
  proyectedBorrowBalance?: string;
  borrowLimit: string;
  proyectedBorrowLimit?: string;
  yieldLabel: string;
  yieldPercent: string;
}

export const TxBorrowLimit: FC<TxBorrowLimitProps> = ({
  borrowBalance,
  proyectedBorrowBalance,
  borrowLimit,
  proyectedBorrowLimit,
  yieldLabel,
  yieldPercent,
}) => {
  if (!proyectedBorrowBalance) proyectedBorrowBalance = borrowBalance;
  if (!proyectedBorrowLimit) proyectedBorrowLimit = borrowLimit;

  const borrowRatio = toBN(borrowLimit).eq(0) ? '0' : toBN(borrowBalance).div(borrowLimit).toString();
  const proyectedBorrowRatio = toBN(proyectedBorrowLimit).eq(0)
    ? '0'
    : toBN(proyectedBorrowBalance).div(proyectedBorrowLimit).toString();

  const limitUsedPercent = toBN(borrowBalance).div(borrowLimit).times(100).toNumber();
  const proyectedLimitUsedPercent = toBN(proyectedBorrowBalance).div(proyectedBorrowLimit).times(100).toNumber();

  return (
    <StyledTxBorrowLimit>
      <Info>
        <StyledText>Borrow Limit</StyledText>
        <StyledText>
          {formatUsd(borrowLimit)}
          {borrowLimit !== proyectedBorrowLimit && <>{` → ${formatUsd(proyectedBorrowLimit)}`}</>}
        </StyledText>
      </Info>

      <Info>
        <StyledText>Borrow Limit Used</StyledText>
        <StyledText>
          {formatPercent(borrowRatio, 0)}
          {formatPercent(borrowRatio, 0) !== formatPercent(proyectedBorrowRatio, 0) && (
            <>{` → ${formatPercent(proyectedBorrowRatio, 0)}`}</>
          )}
        </StyledText>
      </Info>

      <ProgressBar value={limitUsedPercent} diffValue={proyectedLimitUsedPercent} />

      <Info>
        <StyledText>{yieldLabel}</StyledText>
        <StyledText>{yieldPercent}</StyledText>
      </Info>
    </StyledTxBorrowLimit>
  );
};
