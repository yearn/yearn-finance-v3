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
  ARBITER_POSITION_ROLE,
  BORROWER_POSITION_ROLE,
  EnableCollateralAssetProps,
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

const StyledTransaction = styled(TxContainer)`
  min-height: 60vh;
`;

interface EnableCollateralAssetTxProps {
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

export const EnableCollateralAssetTx: FC<EnableCollateralAssetTxProps> = (props) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const history = useHistory();

  // user data
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const walletAddresssk = useAppSelector(WalletSelectors.selectSelectedAddress);
  const userMetadata = useAppSelector(LinesSelectors.selectUserPositionMetadata);
  const selectedLine = useAppSelector(LinesSelectors.selectSelectedLine);
  const selectedEscrow = useAppSelector(CollateralSelectors.selectSelectedEscrow);
  // need to get call statusMap from state for tx error messages
  const collateralStatusMap = useAppSelector(CollateralSelectors.selectStatusMap);

  //state for params
  const { header, onClose } = props;

  const [transactionCompleted, setTransactionCompleted] = useState(0);
  const [transactionApproved, setTransactionApproved] = useState(true);
  const [transactionLoading, setLoading] = useState(false);

  const selectedAssetAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress) || TOKEN_ADDRESSES.DAI;
  // TODO pull colalteralOptions from subgraph instread of default yearn tokens
  const collateralOptions = useAppSelector(selectDepositTokenOptionsByAsset)();
  const selectedAsset = _.find(collateralOptions, (t) => t.address === selectedAssetAddress);
  // TODO get token prices from yearn API and display

  const enabledCollateralAddressess = _.values(selectedLine?.escrow?.deposits)?.map((d) => d.token.address);

  useEffect(() => {
    // if escrow not set yet then correct state
    if (selectedLine?.escrow && !selectedEscrow) {
      dispatch(CollateralActions.setSelectedEscrow({ escrowAddress: selectedLine.escrow.id }));
    }
  });

  useEffect(() => {
    console.log('add position tx useEffect token/creditLine', selectedAsset, selectedLine);
    if (collateralOptions.length > 0 && !selectedAsset) {
      dispatch(
        TokensActions.setSelectedTokenAddress({
          tokenAddress: collateralOptions[0].address,
        })
      );
    }

    if (!selectedLine) {
      return;
    }
  }, [selectedAsset]);

  const notArbiter = selectedLine?.status === ACTIVE_STATUS; // TODO
  if (!notArbiter) {
    onClose(); // close modal and exit
    return null;
  }

  const onNoCollateralAssets = () => {
    console.log('no collateral optionsL');
  };

  const setSelectedAsset = (assetAddress: string) => {
    dispatch(CollateralActions.setSelectedCollateralAsset({ assetAddress }));
  };

  if (collateralOptions.length === 0) {
    return (
      <StyledTransaction onClose={onClose} header={t('components.transaction.add-collateral.no-assets-enabled.title')}>
        <BadLineErrorContainer>
          <BadLineErrorBody>{t('components.transaction.add-collateral.no-assets-enabled.body')}</BadLineErrorBody>
          {userMetadata.role !== ARBITER_POSITION_ROLE ? (
            <>
              <StyledTxActionButton color="primary" onClick={onNoCollateralAssets}>
                {t('components.transaction.add-collateral.no-assets-enabled.find-cta')}
              </StyledTxActionButton>
            </>
          ) : (
            <StyledTxActionButton color="primary" onClick={onNoCollateralAssets}>
              {t('components.transaction.add-collateral.no-assets-enabled.enable-cta')}
            </StyledTxActionButton>
          )}
          <BadLineErrorImageContainer>
            <BadLineErrorImage />
          </BadLineErrorImageContainer>
        </BadLineErrorContainer>
      </StyledTransaction>
    );
  }

  // Event Handlers
  const onTransactionCompletedDismissed = () => {
    if (onClose) {
      onClose();
    } else {
      setTransactionCompleted(0);
    }
  };

  const enableCollateralAsset = () => {
    setLoading(true);

    // TODO set error in state to display no line selected

    if (!selectedEscrow || !selectedAssetAddress) {
      console.log('check this', selectedLine?.id, selectedAssetAddress);
      setLoading(false);
      return; // TODO throw error ot UI component
    }

    console.log('wallet network on enable collat tx', walletNetwork, walletIsConnected, walletAddresssk);
    if (!walletNetwork) {
      setLoading(false);
      return; // TODO throw error ot UI component
    }

    const transactionData: EnableCollateralAssetProps = {
      escrowAddress: selectedEscrow!,
      token: selectedAssetAddress,
      network: walletNetwork,
      dryRun: true,
    };
    //@ts-ignore
    dispatch(CollateralActions.enableCollateral(transactionData)).then((res) => {
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

  if (!selectedAsset) return null;
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
    // should be able to parse custom error data emitted by contract from tx response
    // const errMsg = collateralStatusMap.enableCollateral[selectedLine?.escrow?.id || '']?.[selectedAssetAddress]?.error;

    return (
      <StyledTransaction onClose={onClose} header={'transaction'}>
        <TxStatus
          success={transactionCompleted}
          transactionCompletedLabel={t('components.transaction.enable-collateral-asset.enable-failed')}
          exit={onTransactionCompletedDismissed}
        />
      </StyledTransaction>
    );
  }

  return (
    <StyledTransaction onClose={onClose} header={header}>
      <TxTokenInput
        key={'token-input'}
        style="oracle"
        readOnly
        headerText={t('components.transaction.enable-collateral-asset.token-input-header')}
        inputText={t('components.transaction.oracle-price')}
        selectedToken={selectedAsset}
        onSelectedTokenChange={setSelectedAsset}
        amount={'$' + selectedAsset.priceUsdc}
        tokenOptions={collateralOptions}
        // inputError={!!sourceStatus.error}
        // displayGuidance={displaySourceGuidance}
      />
      <TxActions>
        <TxActionButton
          key={t('components.transaction.enable-collateral-asset.cta') as string}
          data-testid={`modal-action-${t('components.transaction.enable-collateral-asset.cta').toLowerCase()}`}
          onClick={enableCollateralAsset}
          disabled={!transactionApproved}
          contrast={true}
          isLoading={transactionLoading}
        >
          {t('components.transaction.enable-collateral-asset.cta')}
        </TxActionButton>
      </TxActions>
    </StyledTransaction>
  );
};
