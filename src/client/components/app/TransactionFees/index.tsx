import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { Text, Tooltip, Icon, InfoIcon } from '@components/common';
import { Unit } from '@types';
import { formatAmount, toBN } from '@utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-radius: ${({ theme }) => theme.globalRadius};
  background: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
  padding: 0.8rem;
  gap: 0.4rem;
  font-size: 1.2rem;
  width: 100%;
  overflow: hidden;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  display: inline-block;
  margin-left: 0.2rem;
  flex-shrink: 0;
  fill: ${({ theme }) => theme.colors.txModalColors.warning.color};
`;

interface GaslessInfo {
  amount: Unit;
  fee: Unit;
  expected: Unit;
  symbol: string;
}

interface TransactionFeesProps {
  zapService?: string;
  gaslessInfo?: GaslessInfo;
}

export const TransactionFees = ({ zapService, gaslessInfo }: TransactionFeesProps) => {
  const { t } = useAppTranslation('common');

  const showFees = !!zapService || !!gaslessInfo;

  if (!showFees) return null;

  const maxSlippage = gaslessInfo
    ? toBN(gaslessInfo.amount).minus(gaslessInfo.fee).minus(gaslessInfo.expected).toString()
    : '0';

  return (
    <>
      {zapService && (
        <Container>
          <Row>
            <Text display="flex" justifyContent="center" alignItems="center">
              {t('components.transaction.fees.zaps')}
              <Tooltip
                placement="bottom"
                tooltipComponent={<Text fontSize="1.2rem">{t('components.transaction.fees.powered-by')}</Text>}
              >
                <StyledIcon Component={InfoIcon} size="1.5rem" />
              </Tooltip>
            </Text>
            <Text>0.3%</Text>
          </Row>
        </Container>
      )}
      {gaslessInfo && (
        <Container>
          <Row>
            <Text display="flex" justifyContent="center" alignItems="center">
              Fee Amount
              <Tooltip
                placement="bottom"
                tooltipComponent={
                  <Text fontSize="1.2rem">
                    CoW Protocol fees are already included in the expected amount.
                    <br />
                    No ETH is required to execute the transaction.
                  </Text>
                }
              >
                <StyledIcon Component={InfoIcon} size="1.5rem" />
              </Tooltip>
            </Text>
            <Text>{`${formatAmount(gaslessInfo.fee, 8)} ${gaslessInfo.symbol}`}</Text>
          </Row>
          <Row>
            <Text display="flex" justifyContent="center" alignItems="center">
              Max Slippage
              <Tooltip
                placement="bottom"
                tooltipComponent={
                  <Text fontSize="1.2rem">
                    Maximum amount of slippage expected in swap.
                    <br />
                    Already included in the expected amount.
                  </Text>
                }
              >
                <StyledIcon Component={InfoIcon} size="1.5rem" />
              </Tooltip>
            </Text>
            <Text>{`${formatAmount(maxSlippage, 8)} ${gaslessInfo.symbol}`}</Text>
          </Row>
        </Container>
      )}
    </>
  );
};
