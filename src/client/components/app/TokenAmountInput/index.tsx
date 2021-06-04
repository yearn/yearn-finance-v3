import styled from 'styled-components';

import { Card, Text, Input, Box, Button, SimpleDropdown } from '@components/common';
import { toBN, formatUsd } from '@src/utils';
import { TokenIcon } from '../TokenIcon';

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

const SellTokenIcon = styled(TokenIcon)`
  top: 0;
  right: 0;
`;

interface Token {
  address: string;
  symbol: string;
  priceUsdc: string;
  icon?: string;
}

interface TokenAmountInputProps {
  amount: string;
  price: string;
  onAmountChange: (amount: string) => void;
  maxAmount: string;
  selectedToken: Token;
  onSelectedTokenChange?: (address: string) => void;
  tokenOptions?: Token[];
}

export const TokenAmountInput = ({
  amount,
  price,
  onAmountChange,
  maxAmount,
  selectedToken,
  onSelectedTokenChange,
  tokenOptions,
}: TokenAmountInputProps) => {
  const availableTokenOptions = tokenOptions ? tokenOptions : [selectedToken];
  const amountValue = toBN(amount).times(price).toString();

  return (
    <Container>
      <Box position="absolute" right={32}>
        <SellTokenIcon icon={selectedToken.icon} symbol={selectedToken.symbol} />
      </Box>
      <StyledInput value={amount} onChange={(e) => onAmountChange(e.target.value)} placeholder="0.00" />
      <InputControls>
        <Button onClick={() => onAmountChange(maxAmount)}>Max</Button>
        <Text>{`Valued ${formatUsd(amountValue)}`}</Text>
        <SimpleDropdown
          selected={{ label: selectedToken.symbol, value: selectedToken.address }}
          setSelected={(selected) => {
            if (onSelectedTokenChange) {
              onSelectedTokenChange(selected.value);
            }
            onAmountChange('');
          }}
          options={availableTokenOptions.map(({ address, symbol }) => ({ label: symbol, value: address }))}
        />
      </InputControls>
    </Container>
  );
};
