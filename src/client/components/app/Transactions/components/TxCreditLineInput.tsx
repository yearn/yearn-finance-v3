import { FC, useState } from 'react';
import styled from 'styled-components';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { TokenIcon } from '@components/app';
import { useAppTranslation } from '@hooks';
import { Text, Icon, SearchList, LogoIcon, ZapIcon, SearchListItem } from '@components/common';
import { AggregatedCreditLine } from '@src/core/types';

const LineTitle = styled(Text)`
  color: ${({ theme }) => theme.colors.txModalColors.text};
`;

const CreditLineData = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.globalRadius};
  background: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
  padding: ${({ theme }) => theme.layoutPadding};
  font-size: 1.4rem;
  flex: 1;
`;

const CreditLineName = styled.div`
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: center;
  font-size: 1.3rem;
  max-height: 3rem;
`;

const CreditLineListIcon = styled(Icon)`
  position: absolute;
  top: 0.8rem;
  right: 0.4rem;
  color: ${({ theme }) => theme.colors.txModalColors.onBackgroundVariantColor};
`;

const CreditLineIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const CreditLineSelector = styled.div<{ onClick?: () => void; center?: boolean }>`
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

const CreditLineInfo = styled.div<{ center?: boolean }>`
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

const StyledTxCreditLineInput = styled(TransitionGroup)`
  display: grid;
  // min-height: 15.6rem;
  width: 100%;
  border-radius: ${({ theme }) => theme.globalRadius};
  grid-gap: 0.8rem;
  cursor: pointer;

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

export interface TxCreditLineInputProps {
  headerText?: string;
  inputText?: string;
  inputError?: boolean;
  selectedCredit: AggregatedCreditLine;
  onSelectedCreditLineChange?: (address: string) => void;
  creditOptions?: AggregatedCreditLine[];
  readOnly?: boolean;
  loading?: boolean;
  loadingText?: string;
  displayGuidance?: boolean;
}

export const TxCreditLineInput: FC<TxCreditLineInputProps> = ({
  headerText,
  inputText,
  inputError,
  selectedCredit,
  onSelectedCreditLineChange,
  creditOptions,
  readOnly,
  loading,
  loadingText,
  displayGuidance,
  children,
  ...props
}) => {
  const { t } = useAppTranslation('common');

  let listItems: SearchListItem[] = [];
  let zappableItems: SearchListItem[] = [];
  let selectedItem: SearchListItem = {
    id: selectedCredit?.id || '',
    // icon: selectedCredit?.icon,
    label: selectedCredit?.status,
    value: selectedCredit?.principal?.toString(),
  };

  if (creditOptions && creditOptions.length > 1) {
    listItems = creditOptions
      .filter((s) => !!s)
      .map((item) => {
        return {
          id: item!.id,
          // icon: '',
          label: item!.status,
          value: selectedCredit?.principal?.toString(),
        };
      })
      .sort((a, b) => amountToNumber(b.value || '0') - amountToNumber(a.value || '0'));
    zappableItems = listItems.slice(0, 4);
    listItems.sort((a, b) => (a.id === selectedItem.id ? -1 : 1));
  }

  const openSearchList = () => {
    setOpenedSearch(true);
  };

  const [openedSearch, setOpenedSearch] = useState(false);
  const searchListHeader = readOnly
    ? t('components.transaction.add-credit-input.select-an-offer')
    : t('components.transaction.add-credit-input.select-an-offer');

  return (
    <StyledTxCreditLineInput {...props}>
      <>{headerText && <Header>{headerText}</Header>}</>
      {!readOnly && openedSearch && (
        <CSSTransition in={openedSearch} appear={true} timeout={scaleTransitionTime} classNames="scale">
          <StyledSearchList
            list={listItems}
            headerText={searchListHeader}
            selected={selectedItem}
            setSelected={(item) => (onSelectedCreditLineChange ? onSelectedCreditLineChange(item.id) : undefined)}
            onCloseList={() => setOpenedSearch(false)}
          />
        </CSSTransition>
      )}

      {/* NOTE Using fragments here because: https://github.com/yearn/yearn-finance-v3/pull/565 */}
      <>
        <CreditLineInfo center={false} onClick={openSearchList}>
          <CreditLineSelector onClick={listItems?.length > 1 ? openSearchList : undefined} center={false}>
            <CreditLineIconContainer onClick={openSearchList}>
              <TokenIcon SVG={LogoIcon} symbol={selectedItem.label} size="xxBig" />
              {listItems?.length > 1 && <CreditLineListIcon Component={ZapIcon} />}
            </CreditLineIconContainer>
            <CreditLineName>{selectedItem.label}</CreditLineName>
          </CreditLineSelector>
          <CreditLineData>
            <LineTitle ellipsis> Borrower: ENS / {selectedCredit.borrower} </LineTitle>
            <LineTitle ellipsis> Line: {selectedCredit.id || `0xDebf...1dao`}</LineTitle>
          </CreditLineData>
        </CreditLineInfo>
      </>
    </StyledTxCreditLineInput>
  );
};
