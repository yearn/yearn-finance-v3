import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { useHistory } from 'react-router-dom';

import { formatAmount, normalizeAmount, toBN } from '@utils';
import {
  useAppTranslation,
  useAppDispatch,
  // used to dummy token for dev
  useAppSelector,
  useSelectedSellToken,
} from '@hooks';
import { ACTIVE_STATUS, BORROWER_POSITION_ROLE } from '@src/core/types';
import { getConstants } from '@src/config/constants';
import { TokensActions, TokensSelectors, WalletSelectors, LinesSelectors, LinesActions } from '@store';
import { Button } from '@components/common';

import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxCreditLineInput } from './components/TxCreditLineInput';
import { TxRateInput } from './components/TxRateInput';
import { TxActionButton } from './components/TxActions';
import { TxActions } from './components/TxActions';
import { TxStatus } from './components/TxStatus';
import { TxTestTokenInput } from './components/TestTokenList';

const {
  CONTRACT_ADDRESSES: { DAI },
  MAX_INTEREST_RATE,
} = getConstants();
const StyledTransaction = styled(TxContainer)``;

interface AddCreditPositionProps {
  header: string;
  onClose: () => void;
  acceptingOffer: boolean;
  onSelectedCreditLineChange: Function;
  onPositionChange: (data: {
    credit?: string;
    token?: string;
    amount?: string;
    drate?: string;
    frate?: string;
  }) => void;
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

export const AddCreditPositionTx: FC<AddCreditPositionProps> = (props) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const history = useHistory();

  //in case user is on Goerli Testnet, we set up a testnet state:
  const [testnetToken, setTestnetToken] = useState('');
  const [testnetTokenAmount, setTestnetTokenAmount] = useState('0');
  const userMetadata = useAppSelector(LinesSelectors.selectUserPositionMetadata);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const userWallet = useAppSelector(WalletSelectors.selectSelectedAddress);
  const testTokens = [
    {
      address: '0x3730954eC1b5c59246C1fA6a20dD6dE6Ef23aEa6',
      allowancesMap: 'Object {  }',
      balance: '0',
      balanceUsdc: '0',
      categories: ['Seerocoin'],
      decimals: 18,
      description: 'SeeroTestCoin',
      icon: 'https://raw.githack.com/yearn/yearn-assets/master/icons/mult…ns/1/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo-128.png',
      name: 'Serooocoin',
      priceUsdc: '0',
      symbol: 'SER',
      website: 'https://debtdao.finance/',
      yield: '0',
    },
    {
      address: '0x3D4AA21e8915F3b5409BDb20f76457FCdAF8f757',
      allowancesMap: 'Object {  }',
      balance: '0',
      balanceUsdc: '0',
      categories: ['kiibacoin'],
      decimals: 18,
      description: 'KiibaTestCoin',
      icon: 'https://raw.githack.com/yearn/yearn-assets/master/icons/mult…ns/1/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo-128.png',
      name: 'kibaacoin',
      priceUsdc: '0',
      symbol: 'KIB',
      website: 'https://debtdao.finance/',
      yield: '0',
    },
    {
      address: '0xe62e4B079D40CF643D3b4963e4B675eC101928df',
      allowancesMap: 'Object {  }',
      balance: '0',
      balanceUsdc: '0',
      categories: ['Moocoin'],
      decimals: 18,
      description: 'MooTestCoin',
      icon: 'https://raw.githack.com/yearn/yearn-assets/master/icons/mult…ns/1/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo-128.png',
      name: 'Moocoin',
      priceUsdc: '0',
      symbol: 'SER',
      website: 'https://debtdao.finance/',
      yield: '0',
    },
  ];
  const [selectedSellTestToken, setSelectSellTestToken] = useState(testTokens[0]);

  //state for params
  const { acceptingOffer, header, onClose, onPositionChange } = props;
  const [transactionCompleted, setTransactionCompleted] = useState(0);
  const [transactionApproved, setTransactionApproved] = useState(true);
  const [transactionLoading, setLoading] = useState(false);
  const [targetTokenAmount, setTargetTokenAmount] = useState('1');
  const [drate, setDrate] = useState('0.00');
  const [frate, setFrate] = useState('0.00');
  const selectedCredit = useAppSelector(LinesSelectors.selectSelectedLine);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState('');
  const setSelectedCredit = (lineAddress: string) => dispatch(LinesActions.setSelectedLineAddress({ lineAddress }));

  //main net logic
  const selectedSellTokenAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  const initialToken: string = selectedSellTokenAddress || DAI;
  const { selectedSellToken, sourceAssetOptions } = useSelectedSellToken({
    selectedSellTokenAddress: initialToken,
    allowTokenSelect: true,
  });

  useEffect(() => {
    console.log('add position tx useEffect token/creditLine', selectedSellToken, initialToken, selectedCredit);
    console.log('wallet net', walletNetwork);
    if (!selectedSellToken) {
      dispatch(
        TokensActions.setSelectedTokenAddress({
          tokenAddress: sourceAssetOptions[0].address,
        })
      );
    }
    if (selectedTokenAddress === '' && selectedSellToken) {
      setSelectedTokenAddress(selectedSellToken.address);
    }

    if (
      !selectedCredit ||
      !selectedSellToken
      // toBN(targetTokenAmount).lte(0) ||
      // inputError ||
    ) {
      return;
    }
    if (walletNetwork === 'goerli') {
      setTestnetToken(selectedSellTestToken.address);
    }
    // dispatch(CreditLineActions.getCreditLinesDynamicData({ addresses: [initialToken] })); // pulled from DepositTX, not sure why data not already filled
  }, [selectedSellToken, walletNetwork]);

  const _updatePosition = () =>
    onPositionChange({
      credit: selectedCredit?.id,
      token: selectedSellToken?.address,
      amount: targetTokenAmount,
      drate: drate,
      frate: frate,
    });

  // Event Handlers

  const onSelectedSellTestTokenChange = (tokenAddress: string) => {
    let token;
    token = testTokens.filter((token) => token.address === tokenAddress);
    setTargetTokenAmount('');
    onRateChange('f', '0.00');
    onRateChange('d', '0.00');
    setTestnetToken(tokenAddress);
    setSelectSellTestToken(token[0]);
  };

  const onAmountChange = (amount: string): void => {
    setTargetTokenAmount(amount);
    _updatePosition();
  };

  const onTestnetAmountChange = (amount: string): void => {
    setTestnetTokenAmount(amount);
    _updatePosition();
  };

  const onRateChange = (type: string, amount: string): void => {
    if (type === 'd') setDrate(amount);
    if (type === 'f') setFrate(amount);

    _updatePosition();
  };

  const onSelectedCreditLineChange = (addr: string): void => {
    console.log('select new loc', addr);
    setSelectedCredit(addr);
    _updatePosition();
  };

  const onSelectedSellTokenChange = (tokenAddress: string) => {
    setTargetTokenAmount('');
    onRateChange('f', '0.00');
    onRateChange('d', '0.00');
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress }));
  };

  const approveCreditPosition = () => {
    setLoading(true);
    if (!selectedCredit?.id) {
      setLoading(false);
      return;
    }
    let approvalOBj = {
      tokenAddress: walletNetwork === 'goerli' ? testnetToken : selectedSellTokenAddress,
      amount:
        walletNetwork === 'goerli'
          ? `${ethers.utils.parseEther(testnetTokenAmount)}`
          : `${ethers.utils.parseEther(targetTokenAmount)}`,
      network: walletNetwork,
    };
    console.log('approval obj', approvalOBj);
    //@ts-ignore
    dispatch(LinesActions.approveDeposit(approvalOBj)).then((res) => {
      if (res.meta.requestStatus === 'rejected') {
        setTransactionApproved(transactionApproved);
        setLoading(false);
      }
      if (res.meta.requestStatus === 'fulfilled') {
        setTransactionApproved(!transactionApproved);
        setLoading(false);
      }
    });
  };

  const onTransactionCompletedDismissed = () => {
    if (onClose) {
      onClose();
    } else {
      setTransactionCompleted(0);
    }
  };

  const addCreditPosition = () => {
    setLoading(true);
    // TODO set error in state to display no line selected
    if (!selectedCredit?.id || !drate || !frate || userWallet === undefined) {
      setLoading(false);
      return;
    }
    console.log(userWallet);

    let bigNumDRate = toBN(drate);
    let bigNumFRate = toBN(frate);

    console.log(bigNumDRate, bigNumFRate);

    let TransactionObj = {
      lineAddress: selectedCredit.id,
      drate: ethers.utils.parseEther(drate),
      frate: ethers.utils.parseEther(frate),
      amount:
        walletNetwork === 'goerli'
          ? ethers.utils.parseEther(testnetTokenAmount)
          : ethers.utils.parseEther(targetTokenAmount),
      token: walletNetwork === 'goerli' ? testnetToken : selectedSellTokenAddress,
      lender: userWallet,
      network: walletNetwork,
      dryRun: true,
    };
    //@ts-ignore
    dispatch(LinesActions.addCredit(TransactionObj)).then((res) => {
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

  const txActions =
    userMetadata.role === BORROWER_POSITION_ROLE
      ? [
          {
            label: t('components.transaction.deposit'),
            onAction: addCreditPosition,
            status: true,
            disabled: !transactionApproved,
            contrast: true,
          },
        ]
      : [
          {
            label: t('components.transaction.approve'),
            onAction: approveCreditPosition,
            status: true,
            disabled: !transactionApproved,
            contrast: false,
          },
          {
            label: t('components.transaction.deposit'),
            onAction: addCreditPosition,
            status: true,
            disabled: transactionApproved,
            contrast: true,
          },
        ];

  if (!selectedSellToken) return null;
  if (!selectedCredit) return null;

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

  const isActive = selectedCredit.status === ACTIVE_STATUS;
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

  const TokenInput =
    walletNetwork === 'goerli'
      ? () => (
          <TxTestTokenInput
            key={'token-input'}
            headerText={t('components.transaction.add-credit.select-token')}
            inputText={tokenHeaderText}
            amount={testnetTokenAmount}
            onAmountChange={onTestnetAmountChange}
            amountValue={String(10000000 * Number(testnetTokenAmount))}
            maxAmount={targetBalance}
            selectedToken={selectedSellTestToken}
            onSelectedTokenChange={onSelectedSellTestTokenChange}
            tokenOptions={testTokens}
            // inputError={!!sourceStatus.error}
            readOnly={acceptingOffer}
            // displayGuidance={displaySourceGuidance}
          />
        )
      : () => (
          <TxTokenInput
            key={'token-input'}
            headerText={t('components.transaction.add-credit.select-token')}
            inputText={tokenHeaderText}
            amount={targetTokenAmount}
            onAmountChange={onAmountChange}
            amountValue={String(10000000 * Number(targetTokenAmount))}
            maxAmount={targetBalance}
            selectedToken={selectedSellToken}
            onSelectedTokenChange={onSelectedSellTokenChange}
            tokenOptions={sourceAssetOptions}
            // inputError={!!sourceStatus.error}
            readOnly={acceptingOffer}
            // displayGuidance={displaySourceGuidance}
          />
        );

  return (
    <StyledTransaction onClose={onClose} header={header || t('components.transaction.title')}>
      <TxCreditLineInput
        key={'credit-input'}
        headerText={t('components.transaction.add-credit.select-credit')}
        inputText={t('components.transaction.add-credit.select-credit')}
        onSelectedCreditLineChange={onSelectedCreditLineChange}
        selectedCredit={selectedCredit}
        // creditOptions={sourceCreditOptions}
        // inputError={!!sourceStatus.error}
        readOnly={true}
        // displayGuidance={displaySourceGuidance}
      />

      <TokenInput />

      <TxRateInput
        key={'frate'}
        headerText={t('components.transaction.add-credit.select-rates')}
        frate={frate}
        drate={drate}
        amount={frate}
        maxAmount={MAX_INTEREST_RATE.toString()}
        // setRateChange={onFrateChange}
        setRateChange={onRateChange}
        readOnly={acceptingOffer}
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
