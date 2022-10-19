import styled from 'styled-components';

import { Box, Text, Button, BoxProps, SpinnerLoading } from '@components/common';

const InputContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const StyledInput = styled.input<{ readOnly?: boolean; error?: boolean }>`
  height: 5.6rem;
  padding: 1.6rem;
  padding-right: 6.8rem;
  font-size: 1.6rem;
  font-weight: 400;
  background: ${({ theme }) => theme.colors.background};
  outline: none;
  border: none;
  border-width: 0px;
  border-radius: ${({ theme }) => theme.globalRadius};
  color: ${({ theme }) => theme.colors.txModalColors.textContrast};
  font-family: inherit;
  appearance: textfield;
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.colors.txModalColors.textContrast};
  }

  ${({ readOnly, theme }) =>
    readOnly &&
    `
    padding: 1.6rem;
    border: 1px solid ${theme.colors.input?.placeholder || theme.colors.textsVariant};
    color: ${theme.colors.input?.placeholder || theme.colors.textsVariant};
    cursor: default;
    background: transparent;

    &::placeholder {
      color: ${theme.colors.input?.placeholder || theme.colors.textsVariant};
    }

    cursor: not-allowed;
  `}

  ${({ error, theme }) =>
    error &&
    `
    color: ${theme.colors.txModalColors.error};
    border: 1px solid red;
  `}

  ${() => `
    ::-webkit-outer-spin-button,
    ::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    };
  `}
`;

const MaxButton = styled(Button)`
  position: absolute;
  right: 1.6rem;
  border-radius: ${({ theme }) => theme.globalRadius};
  border-width: 1px;
  margin-left: 0.5rem;
  height: 2.4rem;
  font-size: 1.2rem;
  z-index: 1;
`;

const StyledLoading = styled(SpinnerLoading)`
  position: absolute;
  font-size: 1rem;
`;

const StyledCaption = styled(Text)`
  color: ${({ theme }) => theme.colors.input?.placeholder || theme.colors.textsVariant};
  font-size: 1.2rem;
  line-height: 1.6rem;
  margin-top: 0.4rem;
`;

export interface AmountInputProps extends BoxProps {
  amount?: string;
  onAmountChange?: (amount: string) => void;
  maxAmount?: string;
  maxLabel?: string;
  label?: string;
  placeholder?: string;
  message?: string;
  error?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export const AmountInput = ({
  amount,
  onAmountChange,
  maxAmount,
  maxLabel = 'Max',
  label,
  placeholder,
  message,
  error,
  disabled,
  loading,
  ...props
}: AmountInputProps) => {
  return (
    <Box {...props}>
      {label && (
        <Text ellipsis mb="0.4rem">
          {label}
        </Text>
      )}
      <InputContainer>
        <StyledInput
          value={amount}
          onChange={onAmountChange ? (e) => onAmountChange(e.target.value) : undefined}
          placeholder={loading ? '' : placeholder ?? '0'}
          readOnly={disabled}
          error={error}
          type="number"
          aria-label={label}
        />
        {loading && <StyledLoading />}
        {maxAmount && !disabled && (
          <MaxButton outline onClick={onAmountChange ? () => onAmountChange(maxAmount) : undefined}>
            {maxLabel}
          </MaxButton>
        )}
      </InputContainer>
      {message && <StyledCaption>{message}</StyledCaption>}
    </Box>
  );
};
