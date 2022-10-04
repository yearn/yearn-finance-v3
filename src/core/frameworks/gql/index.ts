import { ApolloClient, InMemoryCache, gql, useQuery, DocumentNode, QueryResult } from '@apollo/client';
import { at } from 'lodash';

import { getEnv } from '@config/env';
import { GET_LINE_QUERY, GET_LINE_PAGE_QUERY, GET_LINES_QUERY } from '@config/constants/queries';
import {
  BaseCreditLine,
  AggregatedCreditLine,
  GetLineArgs,
  GetLinePageArgs,
  GetLinesArgs,
  GetUserLinePositionsArgs,
  QueryResponse,
  QueryCreator,
  QueryArgOption,
  GetLinePageResponse,
  PositionSummary,
} from '@src/core/types';

const { GRAPH_API_URL, GRAPH_TEST_API_URL } = getEnv();

let client: any;
export const getClient = () => (client ? client : createClient());
const createClient = (): typeof ApolloClient => {
  client = new ApolloClient({
    uri: GRAPH_API_URL || GRAPH_TEST_API_URL,
    cache: new InMemoryCache(),
  });

  return client;
};

/**
 * @desc - curried factory func to export funcs for each query that can be reused anywhere
 * @example - const getLine = createQuery(GET_LINE_QUERY); getLine({ id: "0x" });
 * @param query - string of graph query
 * @returns {
 *  loading?: boolean; if request has completed or not
 *  error?: object; JS error object?
 *  data?: response data formatted to submitted query
 * }
 * @dev - TODO: allow types to be passed in as args in createQuery so we dont need two lines of code for each function
 *        1. for creating curried func and 2. for defining arg/return types of that func
 */
export const createQuery =
  (query: DocumentNode, path: string = ''): Function =>
  <A, R>(variables: A): Promise<QueryResponse<R>> =>
    new Promise(async (resolve, reject) => {
      getClient()
        .query({ query, variables })
        .then((result: QueryResult) => {
          const { data, error } = result;
          const requestedData = at(data, [path])[0];
          console.log('gql request success', path, result, requestedData);

          if (error) return reject(error);
          else return resolve(requestedData);
        })
        .catch((error: any) => {
          console.log('gql request error', error);
          reject(error);
        });
    });

const getLineQuery = createQuery(GET_LINE_QUERY);

export const getLine: QueryCreator<GetLineArgs, AggregatedCreditLine> = <GetLineArgs, AggregatedCreditLine>(
  arg: GetLineArgs
): QueryResponse<AggregatedCreditLine> => getLineQuery(arg);

const getLinePageQuery = createQuery(GET_LINE_PAGE_QUERY);
export const getLinePage: QueryCreator<GetLinePageArgs, GetLinePageResponse> = <GetLinePageArgs, GetLinePageResponse>(
  arg: GetLinePageArgs
): QueryResponse<GetLinePageResponse> => getLinePageQuery(arg);

const getLinesQuery = createQuery(GET_LINES_QUERY, 'lineOfCredits');
export const getLines: QueryCreator<GetLinesArgs, AggregatedCreditLine[]> = <GetLinesArgs, AggregatedCreditLine>(
  arg: GetLinesArgs
): QueryResponse<AggregatedCreditLine[]> => getLinesQuery(arg);

const getUserLinePositionsQuery = createQuery(GET_LINES_QUERY);
export const getUserLinePositions: QueryCreator<GetUserLinePositionsArgs, PositionSummary[]> = <
  GetUserLinePositionsArgs,
  PositionSummary
>(
  arg: GetUserLinePositionsArgs
) => getUserLinePositionsQuery(arg);
