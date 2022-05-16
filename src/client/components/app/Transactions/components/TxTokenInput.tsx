import { FC, useState } from 'react';
import styled from 'styled-components';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { TokenIcon } from '@components/app';
import { useAppTranslation } from '@hooks';
import { Text, Icon, ChevronRightIcon, Button, SearchList, SearchListItem } from '@components/common';
import { formatUsd, humanize } from '@utils';

const MaxButton = styled(Button)`
  border-radius: ${({ theme }) => theme.globalRadius};
  width: min-content;
  margin-left: 0.5rem;
  text-transform: capitalize;
`;

const StyledAmountInput = styled.input<{ readOnly?: boolean; error?: boolean }>`
  font-size: 2.4rem;
  font-weight: 700;
  background: transparent;
  outline: none;
  border: none;
  color: ${({ theme }) => theme.colors.txModalColors.textContrast};
  padding: 0;
  font-family: inherit;
  appearance: textfield;
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.colors.txModalColors.textContrast};
  }

  ${({ readOnly, theme }) =>
    readOnly &&
    `
    color: ${theme.colors.txModalColors.text};
    cursor: default;

    &::placeholder {
      color: ${theme.colors.txModalColors.text};
    }
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
  max-width: 11rem;
`;

const TokenExtras = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 0.8rem;

  ${StyledText} {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;

const AmountInputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 0.8rem;
`;

const AmountTitle = styled(Text)`
  color: ${({ theme }) => theme.colors.txModalColors.text};
  text-overflow: ellipsis;
`;

const TokenData = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.globalRadius};
  background: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
  padding: ${({ theme }) => theme.layoutPadding};
  font-size: 1.4rem;
  flex: 1;
`;

const TokenName = styled.div`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  font-size: 1.3rem;
  max-height: 3rem;
`;

const TokenListIcon = styled(Icon)`
  position: absolute;
  right: 0.7rem;
  fill: inherit;
  color: ${({ theme }) => theme.colors.txModalColors.onBackgroundVariantColor};
`;

const TokenIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const TokenSelector = styled.div<{ onClick?: () => void; center?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: ${({ center }) => (center ? '100%' : '8.4rem')};
  height: ${({ center }) => (center ? '12.6rem' : undefined)};
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

const TokenInfo = styled.div<{ center?: boolean }>`
  display: flex;
  justify-content: ${({ center }) => (center ? 'center' : 'flex-start')};
  gap: ${({ theme }) => theme.txModal.gap};
  overflow: hidden;
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
  hideAmount?: boolean;
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
  maxLabel = 'Max',
  selectedToken,
  onSelectedTokenChange,
  yieldPercent,
  tokenOptions,
  readOnly,
  hideAmount,
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
      <>{headerText && <Header>{headerText}</Header>}</>
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

      {/* NOTE Using fragments here because: https://github.com/yearn/yearn-finance-v3/pull/565 */}
      <>
        <TokenInfo center={hideAmount}>
          <TokenSelector onClick={listItems?.length > 1 ? openSearchList : undefined} center={hideAmount}>
            <TokenIconContainer>
              <TokenIcon icon={selectedItem.icon} symbol={selectedItem.label} size="big" />
              {listItems?.length > 1 && <TokenListIcon Component={ChevronRightIcon} />}
            </TokenIconContainer>
            <TokenName>{selectedItem.label}</TokenName>
          </TokenSelector>

          {!hideAmount && (
            <TokenData>
              <AmountTitle ellipsis>{inputText || t('components.transaction.token-input.you-have')}</AmountTitle>

              <AmountInputContainer>
                <StyledAmountInput
                  value={amount}
                  onChange={onAmountChange ? (e) => onAmountChange(e.target.value) : undefined}
                  placeholder={loading ? loadingText : '0.00000000'}
                  readOnly={readOnly}
                  error={inputError}
                  type="number"
                  aria-label={headerText}
                />
                {maxAmount && (
                  <MaxButton outline onClick={onAmountChange ? () => onAmountChange(maxAmount) : undefined}>
                    {maxLabel}
                  </MaxButton>
                )}
              </AmountInputContainer>

              <TokenExtras>
                {amountValue && <StyledText>{formatUsd(!loading && !inputError ? amountValue : '0')}</StyledText>}
                {yieldPercent && (
                  <StyledText>
                    {t('components.transaction.token-input.yield')} <ContrastText>{yieldPercent}</ContrastText>
                  </StyledText>
                )}
              </TokenExtras>
            </TokenData>
          )}
        </TokenInfo>
      </>
    </StyledTxTokenInput>
  );
};
