import { Card, Text, SimpleDropdown } from '@components/common';
import { toBN, formatUsd } from '@utils';
import styled from 'styled-components';

const Container = styled(Card)`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 1.6rem;
  font-size: 1.6rem;
  margin-bottom: 0.8rem;
  grid-gap: 0.5rem;
  background-color: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const StyledText = styled(Text)`
  color: ${({ theme }) => theme.colors.txModalColors.textContrast};
`;

const StyledSimpleDropdown = styled(SimpleDropdown)`
  --dropdown-background: ${({ theme }) => theme.colors.txModalColors.background};
  --dropdown-color: ${({ theme }) => theme.colors.txModalColors.textContrast};
  --dropdown-hover-color: ${({ theme }) => theme.colors.txModalColors.primary};
  --dropdown-selected-color: ${({ theme }) => theme.colors.txModalColors.primary};

  color: ${({ theme }) => theme.colors.txModalColors.textContrast};
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
  ...props
}: TransactionSettingsProps) => {
  const maximumSlippageAmount = toBN(amount).times(selectedSlippage.value);
  const minimumAmountReceived = toBN(amount).minus(maximumSlippageAmount).toString();
  return (
    <Container variant="primary" {...props}>
      <Row>
        <StyledText>Slippage tolerance</StyledText>
        <StyledSimpleDropdown
          selected={selectedSlippage}
          setSelected={onSelectedSlippageChange}
          options={slippageOptions}
        />
      </Row>
      <Row>
        <StyledText>Minimum received</StyledText>
        <StyledText>{formatUsd(minimumAmountReceived)}</StyledText>
      </Row>
    </Container>
  );
};
