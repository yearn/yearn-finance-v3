import { FC, useState } from 'react';
import styled from 'styled-components';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { TokenIcon } from '@components/app';
import { useAppTranslation } from '@hooks';
import { Text, Icon, ChevronRightIcon, Button, SearchList, SearchListItem } from '@components/common';
import { formatUsd, humanize } from '@utils';

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
    color: ${theme.colors.txModalColors.onBackgroundVariantColor};
    cursor: default;
  `}

  ${({ error, theme }) => error && `color: ${theme.colors.txModalColors.error};`}

  ${() => `
    ::-webkit-outer-spin-button,
    ::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    };
  `}
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

const AmountTitle = styled(Text)`
  color: ${({ theme }) => theme.colors.txModalColors.text};
`;

const TokenData = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.globalRadius};
  background: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
  border-radius:
  font-size: 1.4rem;
  flex: 1;
`;

const TokenName = styled.div`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  font-size: 1.3rem;
`;

const TokenListIcon = styled(Icon)`
  position: absolute;
  right: 0.7rem;
  top: 3.4rem;
  fill: inherit;
  color: ${({ theme }) => theme.colors.txModalColors.onBackgroundVariantColor};
`;

const TokenIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const TokenSelector = styled.div<{ onClick?: () => void }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 8.4rem;
  height: 9.2rem;
  border-radius: ${({ theme }) => theme.globalRadius};
  background: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
  color: ${({ theme }) => theme.colors.txModalColors.textContrast};
  fill: ${({ theme }) => theme.colors.txModalColors.text};
  flex-shrink: 0;
  padding: 0 0.7rem;
  gap: 0.7rem;
  user-select: none;
  position: relative;
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
  transform-origin: bottom left;
`;

const Header = styled.div`
  font-size: 1.6rem;
  text-transform: capitalize;
  color: ${({ theme }) => theme.colors.txModalColors.text};
`;

const scaleTransitionTime = 300;

const StyledTxTokenInput = styled(TransitionGroup)`
  display: grid;
  // min-height: 15.6rem;
  width: 100%;
  border-radius: ${({ theme }) => theme.globalRadius};
  grid-gap: 0.8rem;

  .scale-enter {
    opacity: 0;
    transform: scale(0);
    transition: opacity ${scaleTransitionTime}ms ease, transform ${scaleTransitionTime}ms ease;
  }
  .scale-enter-active {
    opacity: 1;
    transform: scale(1);
  }
  .scale-exit {
    opacity: 1;
    transform: scale(1);
  }
  .scale-exit-active {
    opacity: 0;
    transform: scale(0);
    transition: opacity ${scaleTransitionTime}ms ease, transform ${scaleTransitionTime}ms cubic-bezier(1, 0.5, 0.8, 1);
  }
`;

const amountToNumber = (amount: string) => {
  const parsedAmount = amount.replace(/[%,$ ]/g, '');
  return parseInt(parsedAmount);
};

interface Token {
  address: string;
  symbol: string;
  icon?: string;
  balance: string;
  balanceUsdc: string;
  decimals: number;
  yield?: string;
}

export interface TxTokenInputProps {
  headerText?: string;
  inputText?: string;
  inputError?: boolean;
  amount: string;
  onAmountChange?: (amount: string) => void;
  amountValue?: string;
  maxAmount?: string;
  maxLabel?: string;
  selectedToken: Token;
  onSelectedTokenChange?: (address: string) => void;
  yieldPercent?: string;
  tokenOptions?: Token[];
  readOnly?: boolean;
  loading?: boolean;
  loadingText?: string;
}

export const TxTokenInput: FC<TxTokenInputProps> = ({
  headerText,
  inputText,
  inputError,
  amount,
  onAmountChange,
  amountValue,
  maxAmount,
  maxLabel = 'MAX',
  selectedToken,
  onSelectedTokenChange,
  yieldPercent,
  tokenOptions,
  readOnly,
  loading,
  loadingText,
  children,
  ...props
}) => {
  const { t } = useAppTranslation('common');

  let listItems: SearchListItem[] = [];
  let selectedItem: SearchListItem = {
    id: selectedToken.address,
    icon: selectedToken.icon,
    label: selectedToken.symbol,
    value: selectedToken.yield ?? humanize('usd', selectedToken.balanceUsdc),
  };

  if (tokenOptions && tokenOptions.length > 1) {
    listItems = tokenOptions
      .map((item) => {
        return {
          id: item.address,
          icon: item.icon,
          label: item.symbol,
          value: item.yield ?? humanize('usd', item.balanceUsdc),
        };
      })
      .sort((a, b) => amountToNumber(b.value) - amountToNumber(a.value));
    listItems.sort((a, b) => (a.id === selectedItem.id ? -1 : 1));
  }

  const openSearchList = () => {
    setOpenedSearch(true);
  };

  const [openedSearch, setOpenedSearch] = useState(false);
  const searchListHeader = selectedToken.yield
    ? t('components.transaction.token-input.search-select-vault')
    : t('components.transaction.token-input.search-select-token');

  return (
    <StyledTxTokenInput {...props}>
      {headerText && <Header>{headerText}</Header>}
      {openedSearch && (
        <CSSTransition in={openedSearch} appear={true} timeout={scaleTransitionTime} classNames="scale">
          <StyledSearchList
            list={listItems}
            headerText={searchListHeader}
            selected={selectedItem}
            setSelected={(item) => (onSelectedTokenChange ? onSelectedTokenChange(item.id) : undefined)}
            onCloseList={() => setOpenedSearch(false)}
          />
        </CSSTransition>
      )}

      <TokenInfo>
        <TokenSelector onClick={listItems?.length > 1 ? openSearchList : undefined}>
          <TokenIconContainer>
            <TokenIcon icon={selectedItem.icon} symbol={selectedItem.label} size="big" />
            {listItems?.length > 1 && <TokenListIcon Component={ChevronRightIcon} />}
          </TokenIconContainer>
          <TokenName>{selectedItem.label}</TokenName>
        </TokenSelector>

        <TokenData>
          <AmountTitle>{inputText || t('components.transaction.token-input.you-have')}</AmountTitle>
          <StyledAmountInput
            value={amount}
            onChange={onAmountChange ? (e) => onAmountChange(e.target.value) : undefined}
            placeholder={loading ? loadingText : '0.00000000'}
            readOnly={readOnly}
            error={inputError}
            type="number"
          />
          <TokenExtras>
            {amountValue && <StyledText>{formatUsd(!loading && !inputError ? amountValue : '0')}</StyledText>}
            {maxAmount && (
              <StyledButton onClick={onAmountChange ? () => onAmountChange(maxAmount) : undefined}>
                {maxLabel}
              </StyledButton>
            )}
            {yieldPercent && (
              <StyledText>
                {t('components.transaction.token-input.yield')} <ContrastText>{yieldPercent}</ContrastText>
              </StyledText>
            )}
          </TokenExtras>
        </TokenData>
      </TokenInfo>
    </StyledTxTokenInput>
  );
};
