import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch } from '@hooks';
import { TokensSelectors, VaultsSelectors, VaultsActions, TokensActions } from '@store';
import { TokenAmountInput, TransactionSettings } from '@components/app';
import { Modal, Card, Text, Box, Button, SimpleDropdown } from '@components/common';
import {
  toBN,
  formatPercent,
  formatAmount,
  normalizeAmount,
  USDC_DECIMALS,
  validateVaultWithdraw,
  validateVaultWithdrawAllowance,
  calculateSharesAmount,
} from '@src/utils';
import { getConfig } from '@config';
import BigNumber from 'bignumber.js';

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

const StyledSimpleDropdown = styled(SimpleDropdown)`
  --dropdown-background: ${({ theme }) => theme.colors.modalColors.backgroundVariant};
  --dropdown-color: ${({ theme }) => theme.colors.modalColors.textContrast};
  --dropdown-hover-color: ${({ theme }) => theme.colors.modalColors.primary};
  --dropdown-selected-color: ${({ theme }) => theme.colors.modalColors.primary};
`;

const StyledButton = styled(Button)`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.modalColors.primary};
  color: ${({ theme }) => theme.colors.modalColors.background};
  text-transform: uppercase;
  font-weight: 500;
  height: 4rem;
`;

const VaultTokenIcon = styled.img`
  height: 3.2rem;
  width: 3.2rem;
`;

interface WithdrawModalProps {
  onClose: () => void;
}

export const WithdrawModal: FC<WithdrawModalProps> = ({ onClose, ...props }) => {
  const { SLIPPAGE_OPTIONS } = getConfig();
  const slippageOptions = SLIPPAGE_OPTIONS.map((value) => ({
    value: value.toString(),
    label: formatPercent(value.toString(), 0),
  }));
  const dispatch = useAppDispatch();
  const [amount, setAmount] = useState('');
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const zapOutTokens = useAppSelector(TokensSelectors.selectZapOutTokens);
  const [selectedTargetTokenAddress, setSelectedTargetTokenAddress] = useState(selectedVault?.token.address ?? '');
  const [selectedSlippage, setSelectedSlippage] = useState(slippageOptions[0]);
  const targetTokensOptions = selectedVault
    ? [selectedVault.token, ...zapOutTokens.filter(({ address }) => address !== selectedVault.token.address)]
    : zapOutTokens;
  const targetTokensOptionsMap = keyBy(targetTokensOptions, 'address');
  const selectedTargetToken = targetTokensOptionsMap[selectedTargetTokenAddress];

  const yvTokenAmount = calculateSharesAmount({
    amount: new BigNumber(amount),
    decimals: selectedVault?.token.decimals?.toString() ?? '0',
    pricePerShare: selectedVault?.pricePerShare ?? '0',
  });

  const { approved: isApproved, error: allowanceError } = validateVaultWithdrawAllowance({
    amount: new BigNumber(normalizeAmount(yvTokenAmount, selectedVault?.token.decimals ?? 1)),
    targetTokenAddress: selectedTargetToken.address,
    underlyingTokenAddress: selectedVault?.token.address ?? '',
    decimals: selectedVault?.token.decimals.toString() ?? '0',
    yvTokenAllowancesMap: selectedVault?.allowancesMap ?? {},
  });

  const { approved: isValidAmount, error: inputError } = validateVaultWithdraw({
    amount: new BigNumber(normalizeAmount(yvTokenAmount, selectedVault?.token.decimals ?? 1)),
    userYvTokenBalance: selectedVault?.DEPOSIT.userBalance ?? '0',
    decimals: selectedVault?.token.decimals.toString() ?? '0',
  });

  useEffect(() => {
    return () => {
      dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress: undefined }));
      dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: undefined }));
    };
  }, []);

  useEffect(() => {
    if (!selectedVault) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedTargetTokenAddress,
        spenderAddress: selectedVault.address,
      })
    );
  }, [selectedTargetTokenAddress]);

  if (!selectedVault || !selectedTargetToken || !targetTokensOptions) {
    return null;
  }

  const balance = normalizeAmount(selectedVault.DEPOSIT.userDeposited, selectedVault.token.decimals);
  const amountValue = toBN(amount).times(normalizeAmount(selectedVault.token.priceUsdc, USDC_DECIMALS)).toString();

  const withdraw = () =>
    dispatch(
      VaultsActions.withdrawVault({
        vaultAddress: selectedVault.address,
        amount: toBN(amount),
        targetTokenAddress: selectedTargetTokenAddress,
      })
    );

  const approve = () => {
    // TODO
    console.log('TO DO');
  };

  return (
    <StyledModal {...props} onClose={onClose}>
      <Text>Withdraw</Text>
      <TransferContainer variant="primary">
        <BalanceContainer>
          <Text>Balance Availability</Text>
          <Text>{`${formatAmount(balance, 4)} ${selectedVault.token.symbol}`}</Text>
        </BalanceContainer>
        <TokenAmountInput
          amount={amount}
          price={normalizeAmount(selectedVault.token.priceUsdc, USDC_DECIMALS)}
          onAmountChange={setAmount}
          maxAmount={balance}
          selectedToken={selectedVault.token}
        />
        <TargetContainer>
          <VaultTokenIcon src={selectedTargetToken.icon} alt={selectedTargetToken.symbol} />
          <StyledSimpleDropdown
            selected={{ value: selectedTargetToken.address, label: selectedTargetToken.name }}
            setSelected={(selected) => setSelectedTargetTokenAddress(selected.value)}
            options={targetTokensOptions.map(({ address, name }) => ({ value: address, label: name }))}
          />
        </TargetContainer>
      </TransferContainer>
      <ButtonContainer>
        <StyledButton onClick={() => approve()} disabled={isApproved}>
          APPROVED
        </StyledButton>
        <StyledButton onClick={() => withdraw()} disabled={!isValidAmount || !isApproved}>
          WITHDRAW
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
