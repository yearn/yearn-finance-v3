import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch } from '@hooks';
import { TokensSelectors, VaultsSelectors, VaultsActions, TokensActions } from '@store';
import { Modal, Card, Text, Input, Box, Button, SimpleDropdown } from '@components/common';
import { humanizeAmount, normalizeAmount } from '@src/utils';

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

const AmountContainer = styled(Card)`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1.6rem;
`;

const VaultContainer = styled(Card)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const StyledInput = styled(Input)`
  font-size: 42px;
  font-weight: 600;
  width: 100%;
  text-align: center;
  background-color: transparent;
  outline: none;
  border: none;
  border-width: 0px;
  padding-right: 3.2rem;
  :focus {
    outline: none !important;
  }
`;

const InputControls = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
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

const SellTokenIcon = styled.img`
  top: 0;
  right: 0;
  height: 3.2rem;
  width: 3.2rem;
`;

const VaultTokenIcon = styled.img`
  height: 3.2rem;
  width: 3.2rem;
`;

interface DepositModalProps {
  onClose: () => void;
}

export const DepositModal: FC<DepositModalProps> = ({ onClose, ...props }) => {
  const dispatch = useAppDispatch();
  const [amount, setAmount] = useState('');
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const [selectedSellTokenAddress, setSelectedSellTokenAddress] = useState(selectedVault?.token.address ?? '');
  const userTokens = useAppSelector(TokensSelectors.selectUserTokens);
  // const userTokensActionsMap = useAppSelector((state) => state.tokens.statusMap.user.userTokensActiosMap);
  // const selectedVaultActionsStatusMap = useAppSelector(VaultsSelectors.selectSelectedVaultActionsStatusMap);
  // const getTokenAllowanceStatus = useAppSelector(
  //   TokensSelectors.selectGetTokenAllowanceStatus(selectedSellTokenAddress)
  // );

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

  const allowance = selectedVault.token.allowancesMap[selectedVault.address] ?? '0';
  const isApproved = new BigNumber(allowance).gte(normalizeAmount(amount, selectedVault.token.decimals));

  const approve = () =>
    dispatch(
      VaultsActions.approveVault({ vaultAddress: selectedVault.address, tokenAddress: selectedSellToken.address })
    );
  const deposit = () =>
    dispatch(VaultsActions.depositVault({ vaultAddress: selectedVault.address, amount: new BigNumber(amount) }));

  return (
    <StyledModal {...props} onClose={onClose}>
      <Text>Invest</Text>
      {/* {getTokenAllowanceStatus.loading && <SpinnerLoading />} */}
      <TransferContainer variant="primary">
        <BalanceContainer>
          <Text>Wallet Balance</Text>
          <Text>{`${humanizeAmount(selectedSellToken.balance, selectedSellToken.decimals, 4)} ${
            selectedSellToken.symbol
          }`}</Text>
        </BalanceContainer>
        <AmountContainer>
          <Box position="absolute" right={32}>
            <SellTokenIcon src={selectedSellToken.icon} alt={selectedSellToken.symbol} />
          </Box>
          <StyledInput value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          <InputControls>
            <Button onClick={() => setAmount(humanizeAmount(selectedSellToken.balance, selectedSellToken.decimals, 4))}>
              Max
            </Button>
            <Text>Valued $0.00</Text>
            <SimpleDropdown
              selected={{ label: selectedSellToken.symbol, value: selectedSellToken.address }}
              setSelected={(selected) => {
                setSelectedSellTokenAddress(selected.value);
                setAmount('');
              }}
              options={sellTokensOptions.map(({ address, symbol }) => ({ label: symbol, value: address }))}
            />
          </InputControls>
        </AmountContainer>
        <VaultContainer>
          <VaultTokenIcon src={selectedVault.token.icon} alt={selectedVault.token.symbol} />
        </VaultContainer>
      </TransferContainer>
      <ButtonContainer>
        <StyledButton onClick={() => approve()}>APPROVE</StyledButton>
        <StyledButton onClick={() => approve()}>INFINITE </StyledButton>
      </ButtonContainer>
      <ButtonContainer>
        <StyledButton onClick={() => deposit()} disabled={!isApproved}>
          DEPOSIT
        </StyledButton>
      </ButtonContainer>
      <BalanceContainer variant="primary">
        <Text textColor="silver">Slippage Tolerance</Text>
        <Text textColor="silver">1%</Text>
      </BalanceContainer>
    </StyledModal>
  );
};
