import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { AggregatedCreditLine, CreditLinePage } from '@src/core/types';
import {
  useAppTranslation,
  useAppDispatch,
  useSelectedCreditLine,

  // used to dummy token for dev
  useAppSelector,
  useSelectedSellToken,
} from '@hooks';

import { LineMetadataDisplay } from './Metadata';

interface LineDetailsProps {
  line?: AggregatedCreditLine;
  page?: CreditLinePage;
}

const Container = styled.div`
  margin: ${({ theme }) => theme.card.padding};
`;

const Header = styled.h1`
  ${({ theme }) => `
    margin-bottom: ${theme.spacing.xl};
    font-size: ${theme.fonts.sizes.xl};
  `};
`;

export const LineDetailsDisplay = (props: LineDetailsProps) => {
  const { t } = useAppTranslation('common');
  const { line, page } = props;
  if (!line && !page) return <Container>{t('lineDetails:line.no-data')}</Container>;

  // allow passing in core data first if we have it already and let Page data render once returned
  if (page) {
    // if we have all data render full UI
    const { principal, deposit, totalInterestRepaid, credits, borrower, start, end } = page;
    return (
      <Container>
        <Header>{borrower}'s Line Of Credit</Header>
        <LineMetadataDisplay
          deposit={deposit}
          principal={principal}
          totalInterestPaid={totalInterestRepaid}
          startTime={start}
          endTime={end}
        />
      </Container>
    );
  } else {
    // render partial UI with core data
    const { principal, deposit, credits, borrower, start, end } = line!;
    return (
      <Container>
        <Header>{borrower}'s Line Of Credit</Header>
        <LineMetadataDisplay
          deposit={deposit}
          principal={principal}
          totalInterestPaid={'0'}
          startTime={start}
          endTime={end}
        />
      </Container>
    );
  }
};
