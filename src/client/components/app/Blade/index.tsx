import { useContext, useState } from 'react';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';

import { selectSelectedVault, depositVault, approveVault, withdrawVault } from '@store';
import { useAppSelector, useAppDispatch } from '@hooks';
import { BladeContext } from '@context';

import { Sidemenu, Icon, DeleteIcon, Button } from '@components/common';

interface SidemenuProps {
  walletAddress?: string;
  onWalletClick?: () => void;
  open: boolean;
}

const StyledBlade = styled(Sidemenu)<{ open: boolean }>`
  background: red;
  background-color: ${(props) => props.theme.colors.shade40};
  width: 40rem;
  max-width: 100%;
`;

const BladeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${(props) => props.theme.navbar.height};
  padding: 0 ${(props) => props.theme.navbar.padding};
`;

const BladeContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${(props) => props.theme.navbar.padding};
  padding-top: 1rem;
`;

const StyledMenuButton = styled.div`
  padding: 1rem;
  margin-right: -1rem;
  flex-shrink: 0;
`;

export const Blade = ({ walletAddress, onWalletClick, open }: SidemenuProps) => {
  const dispatch = useAppDispatch();
  const selectedVault = useAppSelector(selectSelectedVault);
  const { toggle } = useContext(BladeContext);
  const [depositAmount, setDepositAmount] = useState('0');
  const [withdrawAmount, setWithdrawAmount] = useState('0');

  const approve = (vaultAddress: string) => dispatch(approveVault({ vaultAddress }));
  const deposit = (vaultAddress: string, amount: string) =>
    dispatch(depositVault({ vaultAddress, amount: new BigNumber(amount) }));
  const withdraw = (vaultAddress: string, amount: string) =>
    dispatch(withdrawVault({ vaultAddress, amount: new BigNumber(amount) }));

  return (
    <StyledBlade open={open}>
      <BladeHeader>
        <StyledMenuButton onClick={toggle}>
          <Icon src={DeleteIcon} height="24" />
        </StyledMenuButton>
      </BladeHeader>

      <BladeContent>
        <div>
          <div>{selectedVault?.name}</div>
          <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
          <Button onClick={() => approve(selectedVault?.address!)}>Approve</Button>
          <Button onClick={() => deposit(selectedVault?.address!, depositAmount)}>Deposit</Button>
        </div>
        <div>
          <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <Button onClick={() => withdraw(selectedVault?.address!, withdrawAmount)}>Withdraw</Button>
        </div>
      </BladeContent>
    </StyledBlade>
  );
};
