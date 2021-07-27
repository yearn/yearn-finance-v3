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

  return (
    <StyledTxBorrowLimit>
      <Info>
        <StyledText>Borrow Limit</StyledText>
        <StyledText>
          {formatUsd(borrowLimit)}
          {borrowLimit !== proyectedBorrowLimit && <>{` → ${formatUsd(proyectedBorrowLimit)}`}</>}
        </StyledText>
      </Info>
      {/* TODO REMOVE */}
      {toBN(borrowBalance).toNumber()} |{toBN(proyectedBorrowBalance).toNumber()} |
      {toBN(proyectedBorrowLimit ?? borrowLimit).toNumber()}
      {/* END TODO REMOVE */}
      <ProgressBar
        value={toBN(borrowBalance).toNumber()}
        diffValue={toBN(proyectedBorrowBalance).toNumber()}
        maxValue={toBN(proyectedBorrowLimit ?? borrowLimit).toNumber()}
      />
      <Info>
        <StyledText>Borrow Limit Used</StyledText>
        <StyledText>
          {formatPercent(borrowRatio, 0)}
          {formatPercent(borrowRatio, 0) !== formatPercent(proyectedBorrowRatio, 0) && (
            <>{` → ${formatPercent(proyectedBorrowRatio, 0)}`}</>
          )}
        </StyledText>
      </Info>
      <Info>
        <StyledText>{yieldLabel}</StyledText>
        <StyledText>{yieldPercent}</StyledText>
      </Info>
    </StyledTxBorrowLimit>
  );
};
