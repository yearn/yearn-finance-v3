import styled from 'styled-components';

import { Card, Text, Input, Box, Button, SimpleDropdown } from '@components/common';
import { toBN, formatUsd, normalizeAmount, USDC_DECIMALS } from '@src/utils';

const Container = styled(Card)`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1.6rem;
`;

const StyledInput = styled(Input)`
  font-size: 42px;
  font-weight: 600;
  width: 100%;
  text-align: center;
  background-color: transparent;
  outline: none;
  border: none;
  border-width: 0px;
  padding-right: 3.2rem;
  :focus {
    outline: none !important;
  }
`;

const InputControls = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SellTokenIcon = styled.img`
  top: 0;
  right: 0;
  height: 3.2rem;
  width: 3.2rem;
`;

interface Token {
  address: string;
  symbol: string;
  priceUsdc: string;
  icon?: string;
}

interface TokenAmountInputProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  maxAmount: string;
  selectedToken: Token;
  onSelectedTokenChange: (address: string) => void;
  tokenOptions?: Token[];
}

export const TokenAmountInput = ({
  amount,
  onAmountChange,
  maxAmount,
  selectedToken,
  onSelectedTokenChange,
  tokenOptions,
}: TokenAmountInputProps) => {
  const availableTokenOptions = tokenOptions ? tokenOptions : [selectedToken];
  const amountValue = toBN(amount).times(normalizeAmount(selectedToken.priceUsdc, USDC_DECIMALS)).toString();
  return (
    <Container>
      <Box position="absolute" right={32}>
        <SellTokenIcon src={selectedToken.icon} alt={selectedToken.symbol} />
      </Box>
      <StyledInput value={amount} onChange={(e) => onAmountChange(e.target.value)} placeholder="0.00" />
      <InputControls>
        <Button onClick={() => onAmountChange(maxAmount)}>Max</Button>
        <Text>{`Valued ${formatUsd(amountValue)}`}</Text>
        <SimpleDropdown
          selected={{ label: selectedToken.symbol, value: selectedToken.address }}
          setSelected={(selected) => {
            onSelectedTokenChange(selected.value);
            onAmountChange('');
          }}
          options={availableTokenOptions.map(({ address, symbol }) => ({ label: symbol, value: address }))}
        />
      </InputControls>
    </Container>
  );
};
