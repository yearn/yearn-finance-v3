import { FC } from 'react';
import styled from 'styled-components';

import { ProgressBar, Text } from '@components/common';
import { toBN, formatAmount, formatUsd, formatPercent } from '@utils';

type TextColor = 'primary' | 'contrast' | 'positive' | 'negative';

const CustomText = styled(Text)<{ color: TextColor }>`
  color: inherit;

  ${({ color, theme }) => {
    if (color === 'contrast') {
      return `color: ${theme.colors.txModalColors.textContrast}`;
    } else if (color === 'primary') {
      return `color: ${theme.colors.txModalColors.primary}`;
    } else if (color === 'positive') {
      return `color: ${theme.colors.txModalColors.success}`;
    } else if (color === 'negative') {
      return `color: ${theme.colors.txModalColors.loading}`;
    }
  }}}
`;

const BottomInfo = styled.div`
  display: grid;
  grid-gap: 0.2rem;
  margin-top: 2.5rem;
`;

const StyledProgressBar = styled(ProgressBar)`
  margin-top: 0.4rem;
`;

const Info = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  > div {
    display: flex;
    text-align: right;
  }
`;

const StyledTxBorrowLimit = styled.div`
  display: grid;
  background: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
  width: 100%;
  border-radius: ${({ theme }) => theme.globalRadius};
  padding: ${({ theme }) => theme.txModal.gap};
  color: ${({ theme }) => theme.colors.txModalColors.onBackgroundVariantColor};
  grid-gap: 0.2rem;
  font-size: 1.4rem;
  line-height: 1.8rem;
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
  borrowLimitLabel?: string;
  borrowLimitUsedLabel?: string;
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
  borrowLimitLabel,
  borrowLimitUsedLabel,
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
        <Text>{borrowLimitLabel ?? 'Borrow Limit'}</Text>
        <Text>
          <Text>{formatUsd(borrowLimit)}</Text>
          {borrowLimit !== projectedBorrowLimit && <>{` → ${formatUsd(projectedBorrowLimit)}`}</>}
        </Text>
      </Info>

      <Info>
        <Text>{borrowLimitUsedLabel ?? 'Borrow Limit Used'}</Text>
        <Text>
          <CustomText color="primary">{formatPercent(borrowRatio, 0)}&nbsp;</CustomText>
          <CustomText color={limitUsedPercent > projectedLimitUsedPercent ? 'positive' : 'negative'}>
            {formatPercent(borrowRatio, 0) !== formatPercent(projectedBorrowRatio, 0) && (
              <>{` → ${formatPercent(projectedBorrowRatio, 0)}`}</>
            )}
          </CustomText>
        </Text>
      </Info>

      <StyledProgressBar value={limitUsedPercent} diffValue={projectedLimitUsedPercent} />

      <BottomInfo>
        {borrowingTokens && (
          <Info>
            <Text>Borrowing</Text>
            <Text>{`${formatAmount(projectedBorrowingTokens ?? borrowingTokens, 4)} ${tokenSymbol}`}</Text>
          </Info>
        )}

        <Info>
          <Text>{yieldLabel}</Text>
          <CustomText color="contrast">{yieldPercent}</CustomText>
        </Info>
      </BottomInfo>
    </StyledTxBorrowLimit>
  );
};
