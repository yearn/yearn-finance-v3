import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch } from '@hooks';
import { TokensSelectors, VaultsSelectors, VaultsActions, TokensActions } from '@store';
import { TokenAmountInput, TransactionSettings, TokenIcon } from '@components/app';
import { Modal, Card, Text, Box, Button } from '@components/common';
import { toBN, formatPercent, formatAmount, normalizeAmount, USDC_DECIMALS } from '@src/utils';
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
`;

const BalanceContainer = styled(Card)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1.6rem;
  font-size: 1.6rem;
  margin-bottom: 0.8rem;
`;

const TargetContainer = styled(Card)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
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
  const [amount, setAmount] = useState('');
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const [selectedSellTokenAddress, setSelectedSellTokenAddress] = useState(selectedVault?.token.address ?? '');
  const userTokens = useAppSelector(TokensSelectors.selectUserTokens);
  const [selectedSlippage, setSelectedSlippage] = useState(slippageOptions[0]);

  const sellTokensOptions = selectedVault
    ? [selectedVault.token, ...userTokens.filter(({ address }) => address !== selectedVault.token.address)]
    : userTokens;
  const sellTokensOptionsMap = keyBy(sellTokensOptions, 'address');
  const selectedSellToken = sellTokensOptionsMap[selectedSellTokenAddress];

  useEffect(() => {
    if (!selectedVault) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedSellTokenAddress,
        spenderAddress: selectedVault.address,
      })
    );
  }, [selectedSellTokenAddress]);

  if (!selectedVault || !selectedSellToken || !sellTokensOptions) {
    return null;
  }

  const allowance = selectedSellToken.allowancesMap[selectedVault.address] ?? '0';
  const isApproved = toBN(allowance).gte(normalizeAmount(amount, selectedSellToken.decimals));
  const balance = normalizeAmount(selectedSellToken.balance, selectedSellToken.decimals);
  const amountValue = toBN(amount).times(normalizeAmount(selectedSellToken.priceUsdc, USDC_DECIMALS)).toString();

  const approve = () =>
    dispatch(
      VaultsActions.approveVault({ vaultAddress: selectedVault.address, tokenAddress: selectedSellToken.address })
    );
  const deposit = () =>
    dispatch(VaultsActions.depositVault({ vaultAddress: selectedVault.address, amount: toBN(amount) }));

  return (
    <StyledModal {...props} onClose={onClose}>
      <Text>Invest</Text>
      <TransferContainer variant="primary">
        <BalanceContainer>
          <Text>Wallet Balance</Text>
          <Text>{`${formatAmount(balance, 4)} ${selectedSellToken.symbol}`}</Text>
        </BalanceContainer>
        <TokenAmountInput
          amount={amount}
          price={normalizeAmount(selectedSellToken.priceUsdc, USDC_DECIMALS)}
          onAmountChange={setAmount}
          maxAmount={balance}
          selectedToken={selectedSellToken}
          onSelectedTokenChange={setSelectedSellTokenAddress}
          tokenOptions={sellTokensOptions}
        />
        <TargetContainer>
          <TokenIcon icon={selectedVault.token.icon} symbol={selectedVault.token.symbol} />
        </TargetContainer>
      </TransferContainer>
      <ButtonContainer>
        <StyledButton onClick={() => approve()}>APPROVE</StyledButton>
        <StyledButton onClick={() => deposit()} disabled={!isApproved}>
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
