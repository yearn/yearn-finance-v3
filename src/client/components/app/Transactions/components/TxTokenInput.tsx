import { FC } from 'react';
import styled from 'styled-components';

import { TokenIcon } from '@components/app';
import { Input, Text, Icon, ChevronRightIcon, Button } from '@components/common';

import { toBN, formatUsd } from '@src/utils';

const StyledButton = styled(Button)`
  background: ${({ theme }) => theme.colors.txModalColors.onBackgroundVariant};
  color: ${({ theme }) => theme.colors.txModalColors.onBackgroundVariantColor};
  text-transform: uppercase;
  border-radius: 1em;
`;

const StyledAmountInput = styled.input`
  font-size: 3.6rem;
  font-weight: 600;
  width: 100%;
  text-align: right;
  background: transparent;
  outline: none;
  border: none;
  color: ${({ theme }) => theme.colors.txModalColors.textContrast};
  padding: 0;
  font-family: inherit;

  &::placeholder {
    color: ${({ theme }) => theme.colors.txModalColors.onBackgroundVariant};
  }
`;

const ContrastText = styled.span`
  color: ${({ theme }) => theme.colors.txModalColors.success};
`;

const StyledText = styled(Text)`
  color: ${({ theme }) => theme.colors.txModalColors.text};
`;

const TokenExtras = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  ${StyledText} {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;

const TokenData = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  overflow: hidden;
  font-size: 1.4rem;
`;

const TokenName = styled.div``;

const TokenListIcon = styled(Icon)`
  position: absolute;
  right: 0.65rem;
  fill: inherit;
`;

const TokenIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
`;

const TokenSelector = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: 8.4rem;
  height: 9.2rem;
  border-radius: ${({ theme }) => theme.globalRadius};
  background: ${({ theme }) => theme.colors.txModalColors.onBackgroundVariant};
  color: ${({ theme }) => theme.colors.txModalColors.textContrast};
  fill: currentColor;
  flex-shrink: 0;
  padding: 0.7rem;
  gap: 0.7rem;
`;

const TokenInfo = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.txModal.gap};
`;

const Header = styled.div`
  font-weight: 600;
  font-size: 1.4rem;
  text-transform: capitalize;
  color: ${({ theme }) => theme.colors.txModalColors.text};
`;

const StyledTxTokenInput = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
  min-height: 15.6rem;
  width: 100%;
  border-radius: ${({ theme }) => theme.globalRadius};
  padding: ${({ theme }) => theme.txModal.gap};
  gap: 0.8rem;
`;

interface Token {
  address: string;
  symbol: string;
  priceUsdc: string;
  icon?: string;
}

export interface TxTokenInputProps {
  headerText?: string;
  inputText?: string;
  amount: string;
  onAmountChange: (amount: string) => void;
  price?: string;
  maxAmount?: string;
  yieldPercent?: string;
  tokenOptions?: Token[];
}

export const TxTokenInput: FC<TxTokenInputProps> = ({
  headerText,
  inputText,
  amount,
  onAmountChange,
  price,
  maxAmount,
  yieldPercent,
  tokenOptions,
  children,
  ...props
}) => {
  const openTokenDropdown = () => console.log('open dropdown');
  let amountValue;
  if (price) {
    amountValue = toBN(amount).times(price).toString();
  }

  return (
    <StyledTxTokenInput {...props}>
      {headerText && <Header>{headerText}</Header>}

      <TokenInfo>
        <TokenSelector onClick={openTokenDropdown}>
          <TokenIconContainer>
            <TokenIcon
              icon="https://zapper.fi/images/networks/ethereum/0x6c3f90f043a72fa612cbac8115ee7e52bde6e490.png"
              symbol="ETH"
            />
            {tokenOptions && <TokenListIcon Component={ChevronRightIcon} />}
          </TokenIconContainer>
          <TokenName>ETH</TokenName>
        </TokenSelector>

        <TokenData>
          <StyledText>{inputText || 'Balance'}</StyledText>
          <StyledAmountInput
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="00000000.00"
          />
          <TokenExtras>
            {amountValue && <StyledText>≈ {formatUsd(amountValue)}</StyledText>}
            {maxAmount && <StyledButton onClick={() => onAmountChange(maxAmount)}>Max</StyledButton>}
            {yieldPercent && (
              <StyledText>
                Yield <ContrastText>{yieldPercent}%</ContrastText>
              </StyledText>
            )}
          </TokenExtras>
        </TokenData>
      </TokenInfo>

      {/* TODO implement new dropdownList */}
      {/*
      <StyledSimpleDropdown
        selected={{ label: selectedToken.symbol, value: selectedToken.address }}
        setSelected={(selected) => {
          if (onSelectedTokenChange) {
            onSelectedTokenChange(selected.value);
          }
          onAmountChange('');
        }}
        options={availableTokenOptions.map(({ address, symbol }) => ({ label: symbol, value: address }))}
      /> */}
    </StyledTxTokenInput>
  );
};
