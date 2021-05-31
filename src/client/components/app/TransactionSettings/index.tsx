import styled from 'styled-components';

import { Card, Text, SimpleDropdown } from '@components/common';
import { toBN, formatUsd } from '@utils';

const Container = styled(Card)`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 1.6rem;
  font-size: 1.6rem;
  margin-bottom: 0.8rem;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

interface SlippageOption {
  value: string;
  label: string;
}

interface TransactionSettingsProps {
  amount: string;
  selectedSlippage: SlippageOption;
  slippageOptions: SlippageOption[];
  onSelectedSlippageChange: (selected: SlippageOption) => void;
}

export const TransactionSettings = ({
  amount,
  selectedSlippage,
  slippageOptions,
  onSelectedSlippageChange,
}: TransactionSettingsProps) => {
  const maximumSlippageAmount = toBN(amount).times(selectedSlippage.value);
  const minimumAmountReceived = toBN(amount).minus(maximumSlippageAmount).toString();
  return (
    <Container variant="primary">
      <Row>
        <Text>Slippage Tolerance</Text>
        <SimpleDropdown selected={selectedSlippage} setSelected={onSelectedSlippageChange} options={slippageOptions} />
      </Row>
      <Row>
        <Text>Minimum Received</Text>
        <Text>{formatUsd(minimumAmountReceived)}</Text>
      </Row>
    </Container>
  );
};
