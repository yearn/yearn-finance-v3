import _ from 'lodash';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { utils } from 'ethers';

import { useAppSelector, useAppDispatch, useAppTranslation, useQueryParams } from '@hooks';
import { ModalsActions, LinesActions, LinesSelectors } from '@store';
import { RecommendationsCard, SliderCard, ViewContainer } from '@components/app';
import { SpinnerLoading, Text, Button } from '@components/common';
import { AggregatedCreditLine, UseCreditLinesParams } from '@src/core/types';
import { GoblinTown } from '@assets/images';

const StyledRecommendationsCard = styled(RecommendationsCard)``;

const StyledSliderCard = styled(SliderCard)`
  width: 100%;
  min-height: 24rem;
`;

const BannerCtaButton = styled(Button)`
  width: 80%;
  max-width: 20rem;
  margin-top: 1em;
`;

interface VaultsQueryParams {
  search: string;
}

export const Market = () => {
  const { t } = useAppTranslation(['common', 'vaults', 'market']);

  const history = useHistory();
  const queryParams = useQueryParams<VaultsQueryParams>();
  const dispatch = useAppDispatch();
  // const { isTablet, isMobile, width: DWidth } = useWindowDimensions();
  const [search, setSearch] = useState('');

  // TODO not neeed here
  const addCreditStatus = useAppSelector(LinesSelectors.selectLinesActionsStatusMap);

  const defaultLineCategories: UseCreditLinesParams = {
    // using i18m translation as keys for easy display
    'market:featured.highest-credit': {
      first: 3,
      // NOTE: terrible proxy for total credit (oldest = most). Currently getLines only allows filtering by line metadata not modules'
      orderBy: 'start',
      orderDirection: 'asc',
    },
    'market:featured.highest-revenue': {
      first: 16,
      // NOTE: terrible proxy for total revenue earned (highest % = highest notional). Currently getLines only allows filtering by line metadata not modules'
      orderBy: 'defaultSplit',
      orderDirection: 'desc',
    },
    'market:featured.newest': {
      first: 15,
      orderBy: 'start', // NOTE: theoretically gets lines that start in the future, will have to refine query
      orderDirection: 'desc',
    },
  };
  const fetchMarketData = () => dispatch(LinesActions.getLines(defaultLineCategories));
  const lineCategoriesForDisplay = useAppSelector(LinesSelectors.selectLinesForCategories);
  const getLinesStatus = useAppSelector(LinesSelectors.selectLinesStatusMap).getLines;

  console.log('ready', lineCategoriesForDisplay, getLinesStatus);

  useEffect(() => {
    setSearch(queryParams.search ?? '');

    const expectedCategories = _.keys(defaultLineCategories);
    const currentCategories = _.keys(lineCategoriesForDisplay);

    // const shouldFetch = expectedCategories.reduce((bool, cat) => bool && cuirrentCategories.includes(cat), true);
    let shouldFetch: boolean = false;
    expectedCategories.forEach((cat) => (shouldFetch = shouldFetch || !currentCategories.includes(cat)));

    if (shouldFetch) fetchMarketData();
  }, []);

  const onLenderCtaClick = () => {
    window.open('https://docs.debtdao.finance/products/introduction/line-of-credit', '_blank');
  };

  const onBorrowerCtaClick = () => {
    dispatch(ModalsActions.openModal({ modalName: 'createLine' }));
  };

  return (
    <ViewContainer>
      {addCreditStatus.loading && (
        <div>
          <p>.... loading......</p>
        </div>
      )}
      {addCreditStatus.error && (
        <div>
          <p>.... ERROR: {addCreditStatus.error}</p>
        </div>
      )}
      <StyledSliderCard
        header={t('market:banner.title')}
        Component={
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Text>
              <p>{t('market:banner.body')}</p>
            </Text>
            <BannerCtaButton styling="primary" onClick={onBorrowerCtaClick}>
              {t('market:banner.cta-borrower')}
            </BannerCtaButton>
            <BannerCtaButton styling="secondary" outline onClick={onLenderCtaClick}>
              {t('market:banner.cta-lender')}
            </BannerCtaButton>
          </div>
        }
        background={<img src={GoblinTown} alt={'Goblin town or the Citadel?'} />}
      />

      {getLinesStatus.loading || _.isEmpty(lineCategoriesForDisplay) ? (
        <SpinnerLoading flex="1" width="100%" />
      ) : (
        Object.entries(lineCategoriesForDisplay!).map(([key, val]: [string, AggregatedCreditLine[]], i: number) => {
          return (
            <StyledRecommendationsCard
              header={t(key)}
              key={key}
              items={val.map(({ id, borrower, type, spigot, escrow, principal, deposit }) => ({
                icon: '',
                name: borrower + id,
                principal,
                deposit,
                collateral: Object.entries(escrow?.deposits || {})
                  .reduce((sum, [_, val]) => sum.add(val.amount), utils.parseUnits('0', 'ether'))
                  .toString(),
                revenue: Object.values(spigot?.tokenRevenue || {})
                  .reduce((sum, val) => sum.add(val), utils.parseUnits('0', 'ether'))
                  .toString(),
                tags: [spigot ? 'revenue' : '', escrow ? 'collateral' : ''].filter((x) => !!x),
                info: type || 'DAO Line of Credit',
                infoDetail: 'EYY',
                onAction: () => history.push(`/lines/${id}`),
              }))}
            />
          );
        })
      )}
      {/**/}
      {/* TODO keep this UI but populate with state.lines.linesMap */}
    </ViewContainer>
  );
};
