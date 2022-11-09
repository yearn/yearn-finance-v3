import { FC, useState } from 'react';
import styled from 'styled-components';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { useAppTranslation } from '@hooks';
import { Text, Icon, ZapIcon, WalletIcon, LogoIcon } from '@components/common';
import { PositionSearchList } from '@src/client/components/common/PositionSearchList';
import { PositionItem } from '@src/core/types';
import { normalizeAmount } from '@src/utils';

import { TokenIcon } from '../../TokenIcon';

const LineTitle = styled(Text)`
  color: ${({ theme }) => theme.colors.txModalColors.text};
  fontsize: large;
  margin-top: 0.5rem;
`;

const CreditLineData = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.globalRadius};
  background: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
  padding: ${({ theme }) => theme.layoutPadding};
  font-size: 1.7rem;
  flex: 1;
`;

const StyledIcon = styled(Icon)`
  width: 6.4rem;
  padding: 1rem;
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
  padding: 1rem;
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

const StyledSearchList = styled(PositionSearchList)`
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

export interface TxPositionInputProps {
  headerText?: string;
  inputText?: string;
  inputError?: boolean;
  selectedPosition?: PositionItem;
  onSelectedPositionChange?: (arg: PositionItem) => void;
  positions?: PositionItem[];
  readOnly?: boolean;
  loading?: boolean;
  loadingText?: string;
  displayGuidance?: boolean;
}

//@ts-ignore
export const TxPositionInput: FC<TxPositionInputProps> = ({
  headerText,
  inputText,
  inputError,
  selectedPosition,
  onSelectedPositionChange,
  positions,
  readOnly,
  loading,
  loadingText,
  displayGuidance,
  children,
  ...props
}) => {
  const { t } = useAppTranslation('common');

  let listItems: PositionItem[] = [];
  let zappableItems: PositionItem[] = [];

  let selectedItem: PositionItem = {
    id: selectedPosition!.id,
    lender: selectedPosition!.lender,
    // icon: '',
    deposit: selectedPosition!.deposit,
    tokenSymbol: selectedPosition!.tokenSymbol,
    frate: selectedPosition!.frate,
    drate: selectedPosition!.drate,
  };

  if (positions && positions.length >= 1) {
    listItems = positions
      .filter((s) => !!s)
      .map((item) => {
        return {
          id: item!.id,
          lender: item!.lender,
          // icon: '',
          deposit: item!.deposit,
          tokenSymbol: item?.tokenSymbol,
          frate: item?.frate,
          drate: item?.drate,
        };
      });
  }

  const openSearchList = () => {
    setOpenedSearch(true);
  };

  const [openedSearch, setOpenedSearch] = useState(false);
  const searchListHeader = readOnly
    ? t('components.transaction.deposit-and-repay.select-repay')
    : t('components.transaction.deposit-and-repay.select-repay');

  if (selectedPosition === undefined) {
    return;
  }

  return (
    <StyledTxCreditLineInput {...props}>
      <>{headerText && <Header>{headerText}</Header>}</>
      {!readOnly && openedSearch && (
        <CSSTransition in={openedSearch} appear={true} timeout={scaleTransitionTime} classNames="scale">
          <StyledSearchList
            list={listItems}
            headerText={searchListHeader}
            //@ts-ignore
            selected={selectedItem}
            //@ts-ignore
            setSelected={(item) => (onSelectedPositionChange ? onSelectedPositionChange(item) : undefined)}
            onCloseList={() => setOpenedSearch(false)}
          />
        </CSSTransition>
      )}

      {/* NOTE Using fragments here because: https://github.com/yearn/yearn-finance-v3/pull/565 */}
      <>
        <CreditLineInfo center={false} onClick={openSearchList}>
          <CreditLineSelector onClick={listItems?.length > 1 ? openSearchList : undefined} center={false}>
            <CreditLineIconContainer onClick={openSearchList}>
              <TokenIcon SVG={LogoIcon} symbol={selectedItem.tokenSymbol} size="xxBig" />
              {listItems?.length > 1 && <CreditLineListIcon Component={ZapIcon} />}
            </CreditLineIconContainer>
            <CreditLineName>{selectedItem.tokenSymbol}</CreditLineName>
          </CreditLineSelector>
          <CreditLineData>
            <LineTitle ellipsis> Lender: {selectedPosition?.lender} </LineTitle>
            <LineTitle ellipsis>
              {`${normalizeAmount(selectedPosition?.deposit, 18)} ${selectedPosition?.tokenSymbol}
              @${selectedPosition?.drate}/${selectedPosition?.frate}%`}
            </LineTitle>
          </CreditLineData>
        </CreditLineInfo>
      </>
    </StyledTxCreditLineInput>
  );
};
