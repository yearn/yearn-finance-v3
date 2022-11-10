import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
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
  Address,
  ARBITER_POSITION_ROLE,
  BORROWER_POSITION_ROLE,
  UserPositionMetadata,
} from '@src/core/types';
import { getConstants } from '@src/config/constants';
import {
  TokensActions,
  TokensSelectors,
  WalletSelectors,
  LinesSelectors,
  LinesActions,
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

const { ZERO_ADDRESS } = getConstants();

const StyledTransaction = styled(TxContainer)``;

interface AddCollateralTxProps {
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

export const AddCollateralTx: FC<AddCollateralTxProps> = (props) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const history = useHistory();

  const userMetadata = useAppSelector(LinesSelectors.selectUserPositionMetadata);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);

  //state for params
  const { header, onClose } = props;
  const [transactionCompleted, setTransactionCompleted] = useState(0);
  const [transactionApproved, setTransactionApproved] = useState(true);
  const [transactionLoading, setLoading] = useState(false);
  const [targetTokenAmount, setTargetTokenAmount] = useState('1');
  const selectedLine = useAppSelector(LinesSelectors.selectSelectedLine);

  // const onSelectedTokenChanged = props.onSelectedTokenChanged
  // const [selectedTokenAddress, setSelectedTokenAddress] = useState('');

  const setSelectedTokenAddress = (token: string) => dispatch(TokensActions.setSelectedTokenAddress);

  //main net logic
  const selectedCollateralAsset = useAppSelector(CollateralSelectors.selectSelectedCollateralToken);
  // const selectedTokenAddress = useAppSelector(TokensSelectors.selectToken);
  const { selectedSellToken, sourceAssetOptions } = useSelectedSellToken({
    selectedSellTokenAddress: selectedCollateralAsset,
    allowTokenSelect: true,
  });

  const enabledCollateralAddressess = _.values(selectedLine?.escrow?.deposits)?.map((d) => d.token.address);
  const collateralOptions = sourceAssetOptions.filter(({ address }) =>
    _.includes(enabledCollateralAddressess, address)
  );

  useEffect(() => {
    console.log('add position tx useEffect token/creditLine', selectedSellToken, selectedLine);
    console.log('wallet net', walletNetwork);
    if (collateralOptions.length > 0 && !selectedSellToken) {
      dispatch(
        TokensActions.setSelectedTokenAddress({
          tokenAddress: collateralOptions[0].address,
        })
      );
    }

    if ((!selectedSellToken || selectedSellToken.address === ZERO_ADDRESS) && selectedSellToken) {
      setSelectedTokenAddress(selectedSellToken.address);
    }

    if (
      !selectedLine ||
      !selectedSellToken
      // toBN(targetTokenAmount).lte(0) ||
      // inputError ||
    ) {
      return;
    }
    // dispatch(CreditLineActions.getCreditLinesDynamicData({ addresses: [initialToken] })); // pulled from DepositTX, not sure why data not already filled
  }, [selectedSellToken, walletNetwork]);

  if (collateralOptions.length === 0) {
    return (
      <StyledTransaction onClose={onClose} header={t('components.transaction.add-collateral.no-assets-enabled.title')}>
        <BadLineErrorContainer>
          <BadLineErrorBody>{t('components.transaction.add-collateral.no-assets-enabled.body')}</BadLineErrorBody>
          {userMetadata.role !== ARBITER_POSITION_ROLE ? (
            <>
              <StyledTxActionButton color="primary" onClick={onClose}>
                {t('components.transaction.add-collateral.no-assets-enabled.find-cta')}
              </StyledTxActionButton>
              <StyledTxActionButton color="primary" onClick={onClose}>
                {t('components.transaction.add-collateral.no-assets-enabled.login-cta')}
              </StyledTxActionButton>
            </>
          ) : (
            <StyledTxActionButton color="primary" onClick={onClose}>
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
  const approveCollateralToken = () => {
    // setLoading(true);
    // if (!selectedLine?.id) {
    //   setLoading(false);
    //   return;
    // }
    // let approvalOBj = {
    //   tokenAddress: selectedCollateralAsset,
    //   amount: `${ethers.utils.parseEther(targetTokenAmount)}`,
    //   network: walletNetwork,
    // };
    // console.log('approval obj', approvalOBj);
    // //@ts-ignore
    // dispatch(LinesActions.approveDeposit(approvalOBj)).then((res) => {
    //   if (res.meta.requestStatus === 'rejected') {
    //     setTransactionApproved(transactionApproved);
    //     setLoading(false);
    //   }
    //   if (res.meta.requestStatus === 'fulfilled') {
    //     setTransactionApproved(!transactionApproved);
    //     setLoading(false);
    //   }
    // });
  };

  const onTransactionCompletedDismissed = () => {
    if (onClose) {
      onClose();
    } else {
      setTransactionCompleted(0);
    }
  };

  const addCollateral = () => {
    setLoading(true);
    // TODO set error in state to display no line selected
    // if (!selectedLine?.escrow || !selectedCollateralAsset || !targetTokenAmount) {
    //   console.log('check this', selectedLine?.id, targetTokenAmount, selectedCollateralAsset);
    //   setLoading(false);
    //   return;
    // }

    // const transactionData = {
    //   lineAddress: selectedLine.id,
    //   amount: ethers.utils.parseEther(targetTokenAmount),
    //   token: selectedCollateralAsset,
    //   network: walletNetwork,
    //   dryRun: true,
    // };
    // //@ts-ignore
    // dispatch(LinesActions.addCredit(transactionData)).then((res) => {
    //   if (res.meta.requestStatus === 'rejected') {
    //     setTransactionCompleted(2);
    //     console.log(transactionCompleted, 'tester');
    //     setLoading(false);
    //   }
    //   if (res.meta.requestStatus === 'fulfilled') {
    //     setTransactionCompleted(1);
    //     console.log(transactionCompleted, 'tester');
    //     setLoading(false);
    //   }
    // });
  };

  const spigotCollateralSettings = [
    {
      label: t('components.transaction.enableSpigot'),
      onAction: addCollateral,
      status: true,
      disabled: transactionApproved,
      contrast: true,
    },
  ];

  const escrowCollateralSettings = [
    {
      label: t('components.transaction.approve'),
      onAction: approveCollateralToken,
      status: true,
      disabled: !transactionApproved,
      contrast: false,
    },
    {
      label: t('components.transaction.deposit'),
      onAction: addCollateral,
      status: true,
      disabled: transactionApproved,
      contrast: true,
    },
  ];
  const txActions =
    userMetadata.role === ARBITER_POSITION_ROLE
      ? spigotCollateralSettings
      : userMetadata.role === BORROWER_POSITION_ROLE
      ? [...spigotCollateralSettings, ...escrowCollateralSettings]
      : escrowCollateralSettings;

  if (!selectedSellToken) return null;
  if (!selectedLine) return null;

  const targetBalance = normalizeAmount(selectedSellToken.balance, selectedSellToken.decimals);
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
        inputText={tokenHeaderText}
        amount={targetTokenAmount}
        amountValue={String(10000000 * Number(targetTokenAmount))}
        maxAmount={targetBalance}
        selectedToken={selectedSellToken}
        tokenOptions={collateralOptions}
        // inputError={!!sourceStatus.error}
        // displayGuidance={displaySourceGuidance}
      />
      <TxActions>
        {txActions.map(({ label, onAction, status, disabled, contrast }) => (
          <TxActionButton
            key={label}
            data-testid={`modal-action-${label.toLowerCase()}`}
            onClick={onAction}
            disabled={disabled}
            contrast={contrast}
            isLoading={transactionLoading}
          >
            {label}
          </TxActionButton>
        ))}
      </TxActions>
    </StyledTransaction>
  );
};
