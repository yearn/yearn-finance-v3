import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { ethers, BigNumber } from 'ethers';
import _ from 'lodash';
import { useLocation, useHistory } from 'react-router-dom';

import { formatAmount, normalizeAmount, toBN } from '@utils';
import {
  useAppTranslation,
  useAppDispatch,
  // used to dummy token for dev
  useAppSelector,
  useSelectedSellToken,
} from '@hooks';
import {
  ACTIVE_STATUS,
  AddSpigotProps,
  ARBITER_POSITION_ROLE,
  BORROWER_POSITION_ROLE,
  UserPositionMetadata,
} from '@src/core/types';
import { getConstants, TOKEN_ADDRESSES } from '@src/config/constants';
import {
  TokensActions,
  TokensSelectors,
  WalletSelectors,
  LinesSelectors,
  CollateralActions,
  selectDepositTokenOptionsByAsset,
  CollateralSelectors,
} from '@store';
import { Button, Icon, Link } from '@components/common';

import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxCreditLineInput } from './components/TxCreditLineInput';
import { TxRateInput } from './components/TxRateInput';
import { TxActionButton } from './components/TxActions';
import { TxActions } from './components/TxActions';
import { TxStatus } from './components/TxStatus';
import { TxAddressInput } from './components/TxAddressInput';
import { TxNumberInput } from './components/TxNumberInput';

const StyledTransaction = styled(TxContainer)`
  min-height: 60vh;
`;

interface EnableSpigotTxProps {
  header: string;
  onClose: () => void;
}

const BadLineErrorContainer = styled.div``;

const BadLineErrorBody = styled.h3`
  ${({ theme }) => `
    margin: ${theme.spacing.lg} 0;
    font-size: ${theme.fonts.sizes.md};;
  `}
`;

const BadLineErrorImageContainer = styled.div``;

const BadLineErrorImage = styled.img``;

const StyledTxActionButton = styled(Button)<{ color?: string; contrast?: boolean }>`
  height: 4rem;
  flex: 1;
  font-size: 1.6rem;
  font-weight: 700;
  gap: 0.5rem;
  background-color: ${({ theme }) => theme.colors.txModalColors.primary};
  color: ${({ theme }) => theme.colors.txModalColors.onPrimary};
`;

export const EnableSpigotTx: FC<EnableSpigotTxProps> = (props) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const history = useHistory();

  // user data
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const walletAddresssk = useAppSelector(WalletSelectors.selectSelectedAddress);
  const userMetadata = useAppSelector(LinesSelectors.selectUserPositionMetadata);
  const selectedLine = useAppSelector(LinesSelectors.selectSelectedLine);
  // need to get call statusMap from state for tx error messages
  const collateralStatusMap = useAppSelector(CollateralSelectors.selectStatusMap);
  const selectedSpigotAddress = useAppSelector(CollateralSelectors.selectSelectedSpigot);
  const selectedRevenueContractAddress = useAppSelector(CollateralSelectors.selectSelectedRevenueContract);

  //state for params
  const { header, onClose } = props;

  const [transactionCompleted, setTransactionCompleted] = useState(0);
  const [transactionApproved, setTransactionApproved] = useState(true);
  const [transactionLoading, setLoading] = useState(false);

  // spigot setting params
  const [settingOwnerSplit, setOwnerSplit] = useState('100');
  const [settingClaimFunc, setClaimFunc] = useState('');
  const [settingTransferFunc, setTransferFunc] = useState('');

  const selectedAssetAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress) || TOKEN_ADDRESSES.DAI;
  // TODO pull colalteralOptions from subgraph instread of default yearn tokens
  const collateralOptions = useAppSelector(selectDepositTokenOptionsByAsset)();
  const selectedAsset = _.find(collateralOptions, (t) => t.address === selectedAssetAddress);
  // TODO get token prices from yearn API and display

  useEffect(() => {
    // if escrow not set yet then correct state
    if (selectedLine?.spigot && !selectedSpigotAddress) {
      dispatch(CollateralActions.setSelectedEscrow({ escrowAddress: selectedLine.spigot.id }));
    }
  });

  const notArbiter = selectedLine?.status === ACTIVE_STATUS; // TODO
  if (!notArbiter) {
    // onClose(); // close modal and exit
    return null;
  }

  // Event Handlers
  const onTransactionCompletedDismissed = () => {
    if (onClose) {
      onClose();
    } else {
      setTransactionCompleted(0);
    }
  };

  const enableSpigot = () => {
    setLoading(true);

    // TODO set error in state to display no line selected

    if (!selectedLine || !selectedSpigotAddress) {
      console.log('no line/spigot to enable on', selectedLine?.id, selectedSpigotAddress);
      setLoading(false);
      return; // TODO throw error ot UI component
    }

    if (!selectedRevenueContractAddress) {
      console.log('no revenue contract selected to enable', selectedSpigotAddress);
      setLoading(false);
      return; // TODO throw error ot UI component
    }

    console.log('wallet network on enable spigy tx', walletNetwork, walletIsConnected, walletAddresssk);
    if (!walletNetwork) {
      setLoading(false);
      return; // TODO throw error ot UI component
    }

    const transactionData: AddSpigotProps = {
      network: walletNetwork,
      lineAddress: selectedLine.id,
      spigotAddress: selectedSpigotAddress,
      revenueContract: selectedRevenueContractAddress,
      setting: {
        ownerSplit: settingOwnerSplit,
        claimFunction: settingClaimFunc,
        transferOwnerFunction: settingTransferFunc,
      },
    };

    dispatch(CollateralActions.addSpigot(transactionData)).then((res) => {
      if (res.meta.requestStatus === 'rejected') {
        setTransactionCompleted(2);
        console.log(transactionCompleted, 'tester');
        setLoading(false);
      }
      if (res.meta.requestStatus === 'fulfilled') {
        setTransactionCompleted(1);
        console.log(transactionCompleted, 'tester');
        setLoading(false);
      }
    });
  };

  if (!selectedLine) return null;

  if (transactionCompleted === 1) {
    return (
      <StyledTransaction onClose={onClose} header={'transaction'}>
        <TxStatus
          success={transactionCompleted}
          transactionCompletedLabel={'completed'}
          exit={onTransactionCompletedDismissed}
        />
      </StyledTransaction>
    );
  }

  if (transactionCompleted === 2) {
    return (
      <StyledTransaction onClose={onClose} header={'transaction'}>
        <TxStatus
          success={transactionCompleted}
          transactionCompletedLabel={t('components.transaction.enable-spigot.enable-failed')}
          exit={onTransactionCompletedDismissed}
        />
      </StyledTransaction>
    );
  }

  return (
    <StyledTransaction onClose={onClose} header={header}>
      <TxAddressInput headerText={t('components.transaction.enable-spigot.revenue-contract')} address="" />
      <TxNumberInput
        headerText={t('components.transaction.enable-spigot.owner-split')}
        amount={settingOwnerSplit.toString()}
        onInputChange={setOwnerSplit}
        maxAmount={'100'}
      />

      <TxActions>
        <TxActionButton
          key={t('components.transaction.enable-spigot.cta') as string}
          data-testid={`modal-action-${t('components.transaction.enable-spigot.cta').toLowerCase()}`}
          onClick={enableSpigot}
          disabled={!transactionApproved}
          contrast={true}
          isLoading={transactionLoading}
        >
          {t('components.transaction.enable-spigot.cta')}
        </TxActionButton>
      </TxActions>
    </StyledTransaction>
  );
};
