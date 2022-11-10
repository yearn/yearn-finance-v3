import { FC } from 'react';
import styled from 'styled-components';
import { TransitionGroup } from 'react-transition-group';

import { useAppTranslation } from '@hooks';
import { Text } from '@components/common';

const RatesContainer = styled.div``;

const InterestRateInputContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: row;
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
  width: 80%;

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

const InputPercent = styled.span`
  font-size: 2.4rem;
`;

const AmountInputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 0.8rem;
  column-gap: 5rem;
`;

const AmountTitle = styled(Text)`
  color: ${({ theme }) => theme.colors.txModalColors.text};
  text-overflow: ellipsis;
`;

const PositionData = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.globalRadius};
  background: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
  padding: ${({ theme }) => theme.layoutPadding};
  font-size: 1.4rem;
  flex: 1;
`;

const Header = styled.div`
  font-size: 1.6rem;
  text-transform: capitalize;
  color: ${({ theme }) => theme.colors.txModalColors.text};
`;

const scaleTransitionTime = 300;

const StyledTxNumberInput = styled(TransitionGroup)`
  display: grid;
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

export interface TxNumberInputProps {
  headerText?: string;
  inputLabel?: string;
  width?: 'sm' | 'md';
  amount: string;
  maxAmount?: string;
  onInputChange: Function;
  readOnly?: boolean;
  hideAmount?: boolean;
  inputError?: boolean;
}

export const TxNumberInput: FC<TxNumberInputProps> = ({
  headerText,
  inputLabel,
  width = 'sm',
  inputError,
  amount,
  onInputChange,
  // openedTokenSearch,
  // setOpenedTokenSearch,
  // selectedToken,
  // setSelectedToken,
  // tokenList,
  // openedCreditSearch,
  // setOpenedCreditSearch,
  // selectedCredit,
  // setSelectedCredit,
  // creditList,
  maxAmount,
  readOnly,
  hideAmount,
  children,
  ...props
}) => {
  return (
    <>
      <StyledTxNumberInput {...props}>
        <>{headerText && <Header>{headerText}</Header>}</>
        {/* NOTE Using fragments here because: https://github.com/yearn/yearn-finance-v3/pull/565 */}
        <>
          <PositionData>
            <AmountInputContainer>
              <RatesContainer>
                {headerText && <AmountTitle ellipsis>{headerText}</AmountTitle>}
                <InterestRateInputContainer>
                  <StyledAmountInput
                    value={amount}
                    onChange={onInputChange ? (e) => onInputChange(e.target.value) : undefined}
                    placeholder={'15.00'}
                    readOnly={readOnly}
                    error={inputError}
                    type="number"
                    aria-label={inputLabel || ''}
                  />
                  <InputPercent>%</InputPercent>
                </InterestRateInputContainer>
              </RatesContainer>
            </AmountInputContainer>
          </PositionData>
        </>
      </StyledTxNumberInput>
    </>
  );
};
