import { useContext, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';
import BigNumber from 'bignumber.js';

import {
  selectSelectedVault,
  depositVault,
  approveVault,
  withdrawVault,
  selectSelectedVaultActionsStatusMap,
} from '@store';
import { useAppSelector, useAppDispatch } from '@hooks';
import { BladeContext } from '@context';

import { Sidemenu, Icon, DeleteIcon, Button } from '@components/common';
import { SpinnerLoading } from '../../common/SpinnerLoading';

const StyledBlade = styled(Sidemenu)`
  width: 63.5rem;
  max-width: 100%;
  background-color: ${(props) => props.theme.blade.background};
  mix-blend-mode: normal;
  backdrop-filter: blur(${(props) => props.theme.blade.blur});
  padding: 4.7rem 3.6rem;
`;

const BladeHeader = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${(props) => props.theme.navbar.padding};
`;

const BladeContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${(props) => props.theme.navbar.padding};
  margin-top: 3.7rem;
`;

const StyledMenuButton = styled.div`
  position: absolute;
  right: 2.9rem;
  top: 2.2rem;
  padding: 1rem;
  margin-right: -1rem;
  flex-shrink: 0;
  cursor: pointer;
  img {
    height: 1.4rem;
  }
`;

const AssetDescription = styled.span`
  margin-top: 1.8rem;
`;

const ActionList = styled.div`
  display: flex;
  grid-gap: 2.5rem;
  flex-wrap: wrap;
`;

const ActionCardTitle = styled.div`
  font-weight: 500;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ActionCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ActionCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.shade30};
  border-radius: 1.5rem;
  padding: 1.4rem 1.5rem;
  grid-gap: 1rem;
  flex: 1;
`;

const ActionButton = styled(Button)`
  font-size: 1.4rem;
  &.outline {
    border-color: ${(props) => props.theme.colors.shade20};
    color: ${(props) => props.theme.colors.shade20};
  }
`;

const AvailableBalance = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .balance {
    color: ${({ theme }) => theme.colors.shade0};
  }
`;

const StyledSpinnerLoading = styled(SpinnerLoading)`
  font-size: 0.3rem;
  margin-right: 1.1rem;
`;

export const Blade = () => {
  const dispatch = useAppDispatch();
  const selectedVault = useAppSelector(selectSelectedVault);
  const selectedVaultActionsStatusMap = useAppSelector(selectSelectedVaultActionsStatusMap);
  const { approve: approveStatus, deposit: depositStatus, withdraw: withdrawStatus } = selectedVaultActionsStatusMap;
  const { isOpen, toggle } = useContext(BladeContext);
  const [depositAmount, setDepositAmount] = useState('0');
  const [withdrawAmount, setWithdrawAmount] = useState('0');

  const approve = (vaultAddress: string) => dispatch(approveVault({ vaultAddress }));
  const deposit = (vaultAddress: string, amount: string) =>
    dispatch(depositVault({ vaultAddress, amount: new BigNumber(amount) }));
  const withdraw = (vaultAddress: string, amount: string) =>
    dispatch(withdrawVault({ vaultAddress, amount: new BigNumber(amount) }));

  let approveButton;

  if (!selectedVault?.approved) {
    approveButton = (
      <ActionButton
        className="outline"
        onClick={() => approve(selectedVault?.address!)}
        disabled={approveStatus.loading}
      >
        {approveStatus.loading && <StyledSpinnerLoading />} Approve
      </ActionButton>
    );
  }

  return (
    <StyledBlade open={isOpen}>
      <StyledMenuButton onClick={toggle}>
        <Icon src={DeleteIcon} />
      </StyledMenuButton>
      <BladeHeader>
        <h3>{selectedVault?.name}</h3>
        <span className="t-body-light">New to this vault? Learn all you need to know</span>
        <AssetDescription className="t-body-light">
          This SAFE holds multi-collateral DAI. Other assets may be used, however these will be swapped in transit and
          so may incur additional fees.
        </AssetDescription>
      </BladeHeader>

      <BladeContent>
        <ActionList>
          <ActionCardWrapper>
            <ActionCardTitle>Deposit {selectedVault?.token.symbol}</ActionCardTitle>
            <ActionCard>
              <span className="t-body">WALLET BALANCE</span>
              <AvailableBalance>
                <span className="t-body">AVAILABLE</span>
                <strong className="t-body balance">{selectedVault?.token.balance}</strong>
              </AvailableBalance>
              <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
              {approveButton}
              <ActionButton
                className="outline"
                onClick={() => deposit(selectedVault?.address!, depositAmount)}
                disabled={depositStatus.loading}
              >
                {depositStatus.loading && <StyledSpinnerLoading />} Deposit
              </ActionButton>
            </ActionCard>
          </ActionCardWrapper>

          <ActionCardWrapper>
            <ActionCardTitle>Withdraw {selectedVault?.token.symbol}</ActionCardTitle>
            <ActionCard>
              <span className="t-body">SAFE BALANCE</span>
              <AvailableBalance>
                <span className="t-body">AVAILABLE</span>
                <strong className="t-body balance">{selectedVault?.userDeposited}</strong>
              </AvailableBalance>
              <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
              <ActionButton
                className="outline"
                onClick={() => withdraw(selectedVault?.address!, withdrawAmount)}
                disabled={withdrawStatus.loading}
              >
                {withdrawStatus.loading && <StyledSpinnerLoading />} Withdraw
              </ActionButton>
            </ActionCard>
          </ActionCardWrapper>
        </ActionList>
      </BladeContent>
    </StyledBlade>
  );
};
