import { FC, useState } from 'react';
import styled from 'styled-components';

import { TokenIcon } from '@components/app';
import { Text, Icon, ChevronRightIcon, Button, SearchList, SearchListItem } from '@components/common';

import { formatUsd, humanizeAmount } from '@src/utils';

const StyledButton = styled(Button)`
  background: ${({ theme }) => theme.colors.txModalColors.onBackgroundVariant};
  color: ${({ theme }) => theme.colors.txModalColors.onBackgroundVariantColor};
  text-transform: uppercase;
  border-radius: 1em;
`;

const StyledAmountInput = styled.input<{ readOnly?: boolean; error?: boolean }>`
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
  appearance: textfield;

  &::placeholder {
    color: ${({ theme }) => theme.colors.txModalColors.onBackgroundVariant};
  }
  ${({ readOnly, theme }) =>
    readOnly &&
    `
    color: ${theme.colors.txModalColors.onBackgroundVariant};
    cursor: default;
  `}
  ${({ error, theme }) => error && `color: ${theme.colors.txModalColors.error};`}

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
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
  right: 0;
  fill: inherit;
`;

const TokenIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
`;

const TokenSelector = styled.div<{ onClick?: () => void }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: 8.4rem;
  height: 9.2rem;
  border-radius: ${({ theme }) => theme.globalRadius};
  background: ${({ theme }) => theme.colors.txModalColors.onBackgroundVariant};
  color: ${({ theme }) => theme.colors.txModalColors.textContrast};
  fill: ${({ theme }) => theme.colors.txModalColors.text};
  flex-shrink: 0;
  padding: 0.7rem;
  gap: 0.7rem;
  user-select: none;
  ${({ onClick }) => onClick && 'cursor: pointer;'}
`;

const TokenInfo = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.txModal.gap};
`;

const StyledSearchList = styled(SearchList)`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
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
  icon?: string;
  balance: string;
  decimals: number;
}

export interface TxTokenInputProps {
  headerText?: string;
  inputText?: string;
  inputError?: boolean;
  amount: string;
  onAmountChange?: (amount: string) => void;
  amountValue?: string;
  maxAmount?: string;
  selectedToken: Token;
  onSelectedTokenChange?: (address: string) => void;
  yieldPercent?: string;
  tokenOptions?: Token[];
  readOnly?: boolean;
}

export const TxTokenInput: FC<TxTokenInputProps> = ({
  headerText,
  inputText,
  inputError,
  amount,
  onAmountChange,
  amountValue,
  maxAmount,
  selectedToken,
  onSelectedTokenChange,
  yieldPercent,
  tokenOptions,
  readOnly,
  children,
  ...props
}) => {
  let listItems: SearchListItem[] = [];
  let selectedItem: SearchListItem = {
    id: selectedToken.address,
    icon: selectedToken.icon,
    label: selectedToken.symbol,
    value: humanizeAmount(selectedToken.balance, selectedToken.decimals, 4),
  };

  if (tokenOptions && tokenOptions.length > 1) {
    listItems = tokenOptions.map((item) => {
      return {
        id: item.address,
        icon: item.icon,
        label: item.symbol,
        value: humanizeAmount(item.balance, item.decimals, 4),
      };
    });
  }

  const openSearchList = () => {
    setOpenedSearch(true);
  };

  const [openedSearch, setOpenedSearch] = useState(false);

  return (
    <StyledTxTokenInput {...props}>
      {headerText && <Header>{headerText}</Header>}

      {listItems && onSelectedTokenChange && openedSearch && (
        <StyledSearchList
          list={listItems}
          headerText="Select a token"
          selected={selectedItem}
          setSelected={(item) => onSelectedTokenChange(item.id)}
          onCloseList={() => setOpenedSearch(false)}
        />
      )}

      <TokenInfo>
        <TokenSelector onClick={listItems?.length > 1 ? openSearchList : undefined}>
          <TokenIconContainer>
            <TokenIcon icon={selectedItem.icon} symbol={selectedItem.label} />
            {listItems?.length > 1 && <TokenListIcon Component={ChevronRightIcon} />}
          </TokenIconContainer>
          <TokenName>{selectedItem.label}</TokenName>
        </TokenSelector>

        <TokenData>
          <StyledText>{inputText || 'Balance'}</StyledText>
          <StyledAmountInput
            value={amount}
            onChange={onAmountChange ? (e) => onAmountChange(e.target.value) : undefined}
            placeholder="00000000.00"
            readOnly={readOnly}
            error={inputError}
            type="number"
          />
          <TokenExtras>
            {amountValue && <StyledText>≈ {formatUsd(amountValue)}</StyledText>}
            {maxAmount && (
              <StyledButton onClick={onAmountChange ? () => onAmountChange(maxAmount) : undefined}>Max</StyledButton>
            )}
            {yieldPercent && (
              <StyledText>
                Yield <ContrastText>{yieldPercent}</ContrastText>
              </StyledText>
            )}
          </TokenExtras>
        </TokenData>
      </TokenInfo>
    </StyledTxTokenInput>
  );
};
