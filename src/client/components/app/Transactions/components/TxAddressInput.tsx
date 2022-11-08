import { FC } from 'react';
import styled from 'styled-components';
import { TransitionGroup } from 'react-transition-group';

import { useAppTranslation } from '@hooks';
import { Text } from '@components/common';

const StyledBorrowerInput = styled.input<{ readOnly?: boolean; error?: boolean }>`
  font-size: 1.7rem;
  font-weight: 500;
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

export interface TxAddressProps {
  headerText?: string;
  inputText?: string;
  inputError?: boolean;
  borrower: string;
  onBorrowerChange?: (amount: string) => void;
  readOnly?: boolean;
  hideAmount?: boolean;
  loading?: boolean;
  loadingText?: string;
}

export const TxAddressInput: FC<TxAddressProps> = ({
  headerText,
  inputText,
  inputError,
  borrower,
  onBorrowerChange,
  readOnly,
  loading,
  loadingText,
  children,
  ...props
}) => {
  const { t } = useAppTranslation('common');

  return (
    <StyledTxTokenInput {...props}>
      <>{headerText && <Header>{headerText}</Header>}</>

      {/* NOTE Using fragments here because: https://github.com/yearn/yearn-finance-v3/pull/565 */}
      <>
        <TokenData>
          <AmountTitle ellipsis>{inputText || t('components.transaction.token-input.you-have')}</AmountTitle>
          <AmountInputContainer>
            <StyledBorrowerInput
              value={borrower}
              onChange={onBorrowerChange ? (e) => onBorrowerChange(e.target.value) : undefined}
              placeholder={loading ? loadingText : 'Address'}
              readOnly={readOnly}
              error={inputError}
              type="text"
              aria-label={headerText}
            />
          </AmountInputContainer>
        </TokenData>
      </>
    </StyledTxTokenInput>
  );
};
