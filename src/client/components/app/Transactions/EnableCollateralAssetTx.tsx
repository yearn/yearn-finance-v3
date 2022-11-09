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
} from '@store';
import { Button, Icon, Link } from '@components/common';

import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxCreditLineInput } from './components/TxCreditLineInput';
import { TxRateInput } from './components/TxRateInput';
import { TxActionButton } from './components/TxActions';
import { TxActions } from './components/TxActions';
import { TxStatus } from './components/TxStatus';
import { TxTestTokenInput } from './components/TestTokenList';

const StyledTransaction = styled(TxContainer)``;

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
  const userMetadata = useAppSelector(LinesSelectors.selectUserPositionMetadata);
  const selectedLine = useAppSelector(LinesSelectors.selectSelectedLine);

  //state for params
  const { header, onClose } = props;

  const [transactionCompleted, setTransactionCompleted] = useState(0);
  const [transactionApproved, setTransactionApproved] = useState(true);
  const [transactionLoading, setLoading] = useState(false);

  const selectedAssetAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  const collateralOptions = useAppSelector(selectDepositTokenOptionsByAsset)();
  const selectedAsset = !selectedAssetAddress
    ? _.find(collateralOptions, (t) => t.address === TOKEN_ADDRESSES.DAI)
    : _.find(collateralOptions, (t) => t.address === selectedAssetAddress);
  const enabledCollateralAddressess = _.values(selectedLine?.escrow?.deposits)?.map((d) => d.token.address);

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
  }, [selectedAsset, walletNetwork]);

  const onNoCollateralAssets = () => {
    console.log('no collateral optionsL');
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

    if (!selectedLine?.escrow || !selectedAssetAddress) {
      console.log('check this', selectedLine?.id, selectedAssetAddress);
      setLoading(false);
      return; // TODO throw error ot UI component
    }

    if (!walletNetwork) {
      console.log('no wallet network on enable collat tx');
      setLoading(false);
      return; // TODO throw error ot UI component
    }

    const transactionData: EnableCollateralAssetProps = {
      escrowAddress: selectedLine.id,
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

  const targetBalance = normalizeAmount(selectedAsset.balance, selectedAsset.decimals);
  const tokenHeaderText = `${t('components.transaction.token-input.you-have')} ${formatAmount(targetBalance, 4)}`;

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
          transactionCompletedLabel={'could not add credit'}
          exit={onTransactionCompletedDismissed}
        />
      </StyledTransaction>
    );
  }

  const isActive = selectedLine.status === ACTIVE_STATUS;
  if (!isActive) {
    const toMarketplace = () => {
      onClose();
      // send user to top of market page instead of bottom where they currently are
      window.scrollTo({ top: 0, left: 0 });
      history.push('/market');
    };

    return (
      <StyledTransaction onClose={onClose} header={t('components.transaction.add-credit.bad-line.title')}>
        <BadLineErrorContainer>
          <BadLineErrorBody>{t('components.transaction.add-credit.bad-line.body')}</BadLineErrorBody>
          <StyledTxActionButton color="primary" onClick={toMarketplace}>
            {t('components.transaction.add-credit.back-to-market')}
          </StyledTxActionButton>
          <BadLineErrorImageContainer>
            <BadLineErrorImage />
          </BadLineErrorImageContainer>
        </BadLineErrorContainer>
      </StyledTransaction>
    );
  }

  return (
    <StyledTransaction onClose={onClose} header={header || t('components.transaction.title')}>
      <TxTokenInput
        key={'token-input'}
        headerText={t('components.transaction.add-credit.select-token')}
        readOnly
        inputText={tokenHeaderText}
        selectedToken={selectedAsset}
        amount={'0'}
        tokenOptions={collateralOptions}
        // inputError={!!sourceStatus.error}
        // displayGuidance={displaySourceGuidance}
      />
      <TxActions>
        <TxActionButton
          key={t('components.transaction.deposit') as string}
          data-testid={`modal-action-${t('components.transaction.deposit').toLowerCase()}`}
          onClick={enableCollateralAsset}
          disabled={!transactionApproved}
          contrast={true}
          isLoading={transactionLoading}
        >
          {t('components.transaction.deposit')}
        </TxActionButton>
      </TxActions>
    </StyledTransaction>
  );
};
