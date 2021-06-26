import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch } from '@hooks';
import { TokensSelectors, VaultsSelectors, VaultsActions, TokensActions } from '@store';
import { TokenAmountInput, TransactionSettings, TokenIcon } from '@components/app';
import { Modal, Card, Text, Box, Button, SimpleDropdown } from '@components/common';
import {
  toBN,
  formatPercent,
  formatAmount,
  normalizeAmount,
  USDC_DECIMALS,
  validateVaultDeposit,
  validateVaultAllowance,
} from '@src/utils';
import { getConfig } from '@config';

const StyledModal = styled(Modal)`
  width: 38.4rem;
  height: max-content;
`;

const TransferContainer = styled(Card)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 1.6rem;
  background-color: ${({ theme }) => theme.colors.modalColors.backgroundVariant};
`;

const BalanceContainer = styled(Card)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1.6rem;
  font-size: 1.6rem;
  margin-bottom: 0.8rem;
  background-color: ${({ theme }) => theme.colors.modalColors.background};
`;

const TargetContainer = styled(Card)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.modalColors.background};
`;

const ButtonContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1.6rem;
  margin-bottom: 1.6rem;
  width: 100%;
`;

const StyledButton = styled(Button)`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.modalColors.primary};
  color: ${({ theme }) => theme.colors.modalColors.background};
  text-transform: uppercase;
  font-weight: 500;
  height: 4rem;
`;

const StyledSimpleDropdown = styled(SimpleDropdown)`
  --dropdown-background: ${({ theme }) => theme.colors.modalColors.backgroundVariant};
  --dropdown-color: ${({ theme }) => theme.colors.modalColors.textContrast};
  --dropdown-hover-color: ${({ theme }) => theme.colors.modalColors.primary};
  --dropdown-selected-color: ${({ theme }) => theme.colors.modalColors.primary};

  margin-top: 1.2rem;
`;

const StyledText = styled(Text)`
  color: ${({ theme }) => theme.colors.modalColors.textContrast};
`;

interface DepositModalProps {
  onClose: () => void;
}

export const DepositModal: FC<DepositModalProps> = ({ onClose, ...props }) => {
  const { SLIPPAGE_OPTIONS } = getConfig();
  const slippageOptions = SLIPPAGE_OPTIONS.map((value) => ({
    value: value.toString(),
    label: formatPercent(value.toString(), 0),
  }));
  const dispatch = useAppDispatch();
  const [allowVaultSelect, setAllowVaultSelect] = useState(false);
  const [amount, setAmount] = useState('');
  const vaults = useAppSelector(VaultsSelectors.selectVaults);
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const selectedSellTokenAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  const userTokens = useAppSelector(TokensSelectors.selectUserTokens);
  const [selectedSlippage, setSelectedSlippage] = useState(slippageOptions[0]);

  const sellTokensOptions = selectedVault
    ? [selectedVault.token, ...userTokens.filter(({ address }) => address !== selectedVault.token.address)]
    : userTokens;
  const sellTokensOptionsMap = keyBy(sellTokensOptions, 'address');

  useEffect(() => {
    if (!selectedSellTokenAddress && selectedVault) {
      dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: selectedVault.token.address }));
    }

    if (!selectedVault) {
      // TODO: DEFINE DEFAULT SELECTED VAULT ADDRESS CRITERIA
      dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress: '0xE14d13d8B3b85aF791b2AADD661cDBd5E6097Db1' }));
      setAllowVaultSelect(true);
    }

    return () => {
      dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress: undefined }));
      dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: undefined }));
    };
  }, []);

  useEffect(() => {
    if (!selectedVault || !selectedSellTokenAddress) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedSellTokenAddress,
        spenderAddress: selectedVault.address,
      })
    );
  }, [selectedSellTokenAddress]);

  if (!selectedVault || !selectedSellTokenAddress || !sellTokensOptions) {
    return null;
  }

  const selectedSellToken = sellTokensOptionsMap[selectedSellTokenAddress];
  const { approved: isApproved, error: allowanceError } = validateVaultAllowance({
    amount: toBN(amount),
    vaultAddress: selectedVault.address,
    vaultUnderlyingTokenAddress: selectedVault.token.address,
    sellTokenAddress: selectedSellTokenAddress,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    sellTokenAllowancesMap: selectedSellToken.allowancesMap,
  });
  const { approved: isValidAmount, error: inputError } = validateVaultDeposit({
    sellTokenAmount: toBN(amount),
    depositLimit: selectedVault.depositLimit,
    emergencyShutdown: selectedVault.emergencyShutdown,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    userTokenBalance: selectedSellToken.balance,
    vaultUnderlyingBalance: selectedVault.vaultBalance,
  });

  const balance = normalizeAmount(selectedSellToken.balance, selectedSellToken.decimals);
  const amountValue = toBN(amount).times(normalizeAmount(selectedSellToken.priceUsdc, USDC_DECIMALS)).toString();

  const approve = () =>
    dispatch(
      VaultsActions.approveDeposit({ vaultAddress: selectedVault.address, tokenAddress: selectedSellToken.address })
    );
  const deposit = () =>
    dispatch(
      VaultsActions.depositVault({
        vaultAddress: selectedVault.address,
        tokenAddress: selectedSellToken.address,
        amount: toBN(amount),
      })
    );

  return (
    <StyledModal {...props} onClose={onClose}>
      <StyledText>Invest</StyledText>

      <TransferContainer>
        <BalanceContainer>
          <StyledText>Wallet Balance</StyledText>
          <StyledText>{`${formatAmount(balance, 4)} ${selectedSellToken.symbol}`}</StyledText>
        </BalanceContainer>
        <TokenAmountInput
          amount={amount}
          price={normalizeAmount(selectedSellToken.priceUsdc, USDC_DECIMALS)}
          onAmountChange={setAmount}
          maxAmount={balance}
          selectedToken={selectedSellToken}
          onSelectedTokenChange={(tokenAddress) => dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress }))}
          tokenOptions={allowVaultSelect ? undefined : sellTokensOptions}
        />
        <TargetContainer>
          <TokenIcon icon={selectedVault.token.icon} symbol={selectedVault.token.symbol} />
          <StyledSimpleDropdown
            selected={{ label: selectedVault.token.symbol, value: selectedVault.token.address }}
            setSelected={(selected) =>
              dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress: selected.value }))
            }
            options={vaults
              .filter(({ address }) => allowVaultSelect || address === selectedVault.address)
              .map(({ address, name }) => ({ value: address, label: name }))}
          />
        </TargetContainer>
      </TransferContainer>

      <ButtonContainer>
        <StyledButton onClick={() => approve()} disabled={isApproved}>
          APPROVE
        </StyledButton>
        <StyledButton onClick={() => deposit()} disabled={!isApproved || !isValidAmount}>
          DEPOSIT
        </StyledButton>
      </ButtonContainer>

      <TransactionSettings
        amount={amountValue}
        selectedSlippage={selectedSlippage}
        slippageOptions={slippageOptions}
        onSelectedSlippageChange={setSelectedSlippage}
      />
    </StyledModal>
  );
};
