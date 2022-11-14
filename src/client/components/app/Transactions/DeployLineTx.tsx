import { FC, useState } from 'react';
import { BigNumber } from 'ethers';
import styled from 'styled-components';

import { isAddress, toWei } from '@utils';
import { useAppTranslation, useAppDispatch, useAppSelector } from '@hooks';
import { LinesActions, WalletSelectors } from '@store';
import { getConstants } from '@src/config/constants';

import { ToggleButton } from '../../common';

import { TxContainer } from './components/TxContainer';
import { TxAddressInput } from './components/TxAddressInput';
import { TxTTLInput } from './components/TxTTLInput';
import { TxActions } from './components/TxActions';
import { TxActionButton } from './components/TxActions';
import { TxNumberInput } from './components/TxNumberInput';
import { TxStatus } from './components/TxStatus';

const StyledTransaction = styled(TxContainer)``;

const { LineFactory_GOERLI } = getConstants();

const SectionContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  grid-gap: 1.2rem;
  justify-content: right;
`;

interface DeployLineProps {
  header: string;
  onClose: () => void;
  onPositionChange: (data: {
    credit?: string;
    token?: string;
    amount?: string;
    drate?: string;
    frate?: string;
  }) => void;
}

export const DeployLineTx: FC<DeployLineProps> = (props) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();

  // Deploy Line base data state
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const [transactionCompleted, setTransactionCompleted] = useState(0);
  const { header, onClose } = props;
  const [borrower, setBorrower] = useState('');
  const [inputAddressWarning, setWarning] = useState('');
  const [inputTTLWarning, setTTLWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeToLive, setTimeToLive] = useState('0');

  // Deploy Line with config state
  const [advancedMode, setAdvancedMode] = useState(false);
  const [cratio, setCratio] = useState('0');
  const [revenueSplit, setRevenueSplit] = useState('0');

  const toggleSecuredMode = () => {
    setAdvancedMode(!advancedMode);
  };

  const onAmountChange = (ttl: string) => {
    let timeToLive = +ttl * 24 * 60 * 60;
    setTimeToLive(timeToLive.toString());
  };

  const onCratioChange = (amount: string) => {
    setCratio(amount);
  };

  const onRevenueSplitChange = (amount: string) => {
    setRevenueSplit(amount);
  };

  const onTransactionCompletedDismissed = () => {
    if (onClose) {
      onClose();
    } else {
      setTransactionCompleted(0);
    }
  };

  const onBorrowerAddressChange = (address: string) => {
    setBorrower(address);
  };

  const deploySecuredLineNoConfig = async () => {
    setLoading(true);
    let checkSumAddress = await isAddress(borrower);

    if (!checkSumAddress || walletNetwork === undefined) {
      setWarning('Incorrect address, please verify and try again.');
      return;
    }

    if (+timeToLive <= 0) {
      setTTLWarning('Increase TTL, cannot be 0.');
      return;
    }

    try {
      // TODO Dynamic var based on network

      dispatch(
        LinesActions.deploySecuredLine({
          factory: LineFactory_GOERLI,
          borrower,
          ttl: BigNumber.from(timeToLive),
          network: walletNetwork,
        })
      ).then((res) => {
        if (res.meta.requestStatus === 'rejected') {
          setTransactionCompleted(2);
          setLoading(false);
        }
        if (res.meta.requestStatus === 'fulfilled') {
          setTransactionCompleted(1);
          setLoading(false);
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  const deploySecuredLineWithConfig = async () => {
    setLoading(true);
    let checkSumAddress = await isAddress(borrower);

    if (!checkSumAddress || walletNetwork === undefined) {
      setWarning('Incorrect address, please verify and try again.');
      return;
    }

    if (+timeToLive <= 0) {
      setTTLWarning('Increase TTL, cannot be 0.');
      return;
    }

    // BPS IS USED so we must multiply by 10^2
    let BNCratio = toWei(cratio, 2);

    // BPS IS NOT USED so we run through toWei to get BN
    let BNRevenueSplit = toWei(revenueSplit, 0);
    console.log(typeof BNCratio);

    try {
      // TODO Dynamic var based on network

      dispatch(
        LinesActions.deploySecuredLineWithConfig({
          factory: LineFactory_GOERLI,
          borrower,
          ttl: BigNumber.from(timeToLive),
          network: walletNetwork,
          //@ts-ignore
          revenueSplit: BNRevenueSplit,
          //@ts-ignore
          cratio: BNCratio,
        })
      ).then((res) => {
        if (res.meta.requestStatus === 'rejected') {
          setTransactionCompleted(2);
          setLoading(false);
        }
        if (res.meta.requestStatus === 'fulfilled') {
          setTransactionCompleted(1);
          setLoading(false);
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  if (transactionCompleted === 1) {
    return (
      <StyledTransaction onClose={onClose} header={'Transaction complete'}>
        <TxStatus
          success={transactionCompleted}
          transactionCompletedLabel={'deployed line successfully'}
          exit={onTransactionCompletedDismissed}
        />
      </StyledTransaction>
    );
  }

  if (transactionCompleted === 2) {
    return (
      <StyledTransaction onClose={onClose} header={'Transaction failed'}>
        <TxStatus
          success={transactionCompleted}
          transactionCompletedLabel={'Could not deploy line'}
          exit={onTransactionCompletedDismissed}
        />
      </StyledTransaction>
    );
  }

  return (
    <StyledTransaction onClose={onClose} header={header || t('components.transaction.title')}>
      <TxAddressInput
        key={'credit-input'}
        headerText={t('components.transaction.deploy-line.select-borrower')}
        inputText={t('components.transaction.deploy-line.select-borrower')}
        onAddressChange={onBorrowerAddressChange}
        address={borrower}
        // creditOptions={sourceCreditOptions}
        // inputError={!!sourceStatus.error}
        readOnly={false}
        // displayGuidance={displaySourceGuidance}
      />
      {inputAddressWarning !== '' ? <div style={{ color: '#C3272B' }}>{inputAddressWarning}</div> : ''}
      <TxTTLInput
        headerText={t('components.transaction.deploy-line.select-ttl')}
        inputText={t('components.transaction.deploy-line.time-to-live')}
        inputError={false}
        amount={timeToLive}
        onAmountChange={onAmountChange}
        maxAmount={'360'}
        maxLabel={'Max'}
        readOnly={false}
        hideAmount={false}
        loading={false}
        loadingText={''}
        ttlType={true}
      />
      {inputTTLWarning !== '' ? <div style={{ color: '#C3272B' }}>{inputTTLWarning}</div> : ''}
      {advancedMode ? (
        <SectionContent>
          <TxNumberInput
            headerText={t('components.transaction.deploy-line.cratio')}
            inputLabel={t('components.transaction.deploy-line.cratio-input')}
            width={'sm'}
            amount={cratio}
            maxAmount={'max string'}
            onInputChange={onCratioChange}
            readOnly={false}
            hideAmount={false}
            inputError={false}
          />
          <TxNumberInput
            headerText={t('components.transaction.deploy-line.revenue-split')}
            inputLabel={t('components.transaction.deploy-line.revenue-split-input')}
            width={'sm'}
            amount={revenueSplit}
            maxAmount={'max string'}
            onInputChange={onRevenueSplitChange}
            readOnly={false}
            hideAmount={false}
            inputError={false}
          />
        </SectionContent>
      ) : (
        <h6>You should not deploy a line without discussing terms.</h6>
      )}
      <SectionContent>
        <>
          Advanced Mode
          <ToggleButton
            selected={advancedMode}
            setSelected={() => toggleSecuredMode()}
            className=""
            disabled={false}
            color=""
            onClick={() => {}}
            ariaLabel=""
          />
        </>
      </SectionContent>

      <TxActions>
        <TxActionButton
          key={''}
          onClick={advancedMode ? deploySecuredLineWithConfig : deploySecuredLineNoConfig}
          disabled={false}
          contrast={false}
          isLoading={loading}
        >
          {'Deploy Line'}
        </TxActionButton>
      </TxActions>
    </StyledTransaction>
  );
};
