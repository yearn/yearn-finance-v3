import { useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';
import { VaultsActions, VaultsSelectors } from '@store';
import { Box, Button } from '@components/common';
import { SummaryCard, DetailCard } from '@components/app';
import { formatUsd } from '@src/utils';

const Container = styled.div`
  margin: 1.6rem;
`;

interface TokenProps {
  address: string;
  symbol: string;
}

const Token = ({ address, symbol }: TokenProps) => {
  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <img
        alt={symbol}
        src={`https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/${address}/logo-128.png`}
        width="36"
        height="36"
      />
    </Box>
  );
};

interface ActionProps {
  type: 'tokens';
}

const Actions = ({ type }: ActionProps) => {
  switch (type) {
    case 'tokens':
      return (
        <Box display="flex" flexDirection="row" alignItems="center">
          <Button>Invest</Button>
          <Button>Lend</Button>
          <Button>Borrow</Button>
        </Box>
      );
  }
};

export const Wallet = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  const { totalDeposits } = useAppSelector(VaultsSelectors.selectSummaryData);

  useEffect(() => {
    dispatch(VaultsActions.initiateSaveVaults());
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      dispatch(VaultsActions.getUserVaultsData({}));
    }
  }, [selectedAddress]);

  return (
    <Container>
      <SummaryCard
        items={[
          { header: 'Balance', content: `${formatUsd(totalDeposits)}` },
          { header: 'Tokens Owned', content: `2` },
        ]}
        variant="surface"
      />

      <DetailCard
        header="Deposits"
        metadata={[
          {
            key: 'icon',
            transform: ({ address, symbol }) => <Token address={address} symbol={symbol} />,
            width: '4.8rem',
          },
          { key: 'name', header: 'Name' },
          { key: 'balance', header: 'Balance' },
          { key: 'price', header: 'Price' },
          { key: 'value', header: 'Value' },
          { key: 'actions', transform: () => <Actions type="tokens" />, align: 'flex-end', grow: '1' },
        ]}
        data={[
          {
            address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            symbol: 'DAI',
            name: 'DAI',
            balance: '30,000.00',
            price: '$ 1.01',
            value: '$ 30,300.00',
          },
          {
            address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
            symbol: 'YFI',
            name: 'YFI',
            balance: '1.20',
            price: '$ 50,000.00',
            value: '$ 60,000.00',
          },
        ]}
      />
    </Container>
  );
};
