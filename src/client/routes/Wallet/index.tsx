import { useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';
import { VaultsActions, VaultsSelectors, TokensSelectors, TokensActions } from '@store';
import { Box, Button } from '@components/common';
import { SummaryCard, DetailCard } from '@components/app';
import { formatUsd, humanizeAmount, USDC_DECIMALS } from '@src/utils';

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
      <img alt={symbol} src={`https://zapper.fi/images/${symbol}-icon.png`} width="36" height="36" />
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
  const { totalBalance, tokensAmount } = useAppSelector(TokensSelectors.selectSummaryData);
  const userTokens = useAppSelector(TokensSelectors.selectUserTokens);

  useEffect(() => {
    dispatch(VaultsActions.initiateSaveVaults());
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      dispatch(VaultsActions.getUserVaultsData({}));
      dispatch(TokensActions.getUserTokens({}));
    }
  }, [selectedAddress]);

  return (
    <Container>
      <SummaryCard
        items={[
          { header: 'Balance', content: `$ ${humanizeAmount(totalBalance, USDC_DECIMALS, 2)}` },
          { header: 'Tokens Owned', content: tokensAmount },
        ]}
        variant="secondary"
      />

      <DetailCard
        header="Tokens"
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
        data={userTokens.map((token) => ({
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          balance: humanizeAmount(token.balance, token.decimals, 2),
          price: `$ ${humanizeAmount(token.priceUsdc, USDC_DECIMALS, 4)}`,
          value: `$ ${humanizeAmount(token.balanceUsdc, USDC_DECIMALS, 2)}`,
        }))}
      />
    </Container>
  );
};
