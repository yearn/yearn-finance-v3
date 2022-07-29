import {
  CreditLineService,
  YearnSdk,
  TokenDynamicData,
  CreditLine,
  ApproveProps,
  TransactionService,
  Web3Provider,
  Balance,
  Token,
  Integer,
  Config,
  Network,
  GetCreditLinesProps,
} from '@types';
import { getConfig } from '@config';

export class CreditLineServiceImpl implements CreditLineService {
  private graphUrl: string;
  private web3Provider: Web3Provider;
  private transactionService: TransactionService;
  private config: Config;

  constructor({
    transactionService,
    yearnSdk,
    web3Provider,
    config,
  }: {
    transactionService: TransactionService;
    web3Provider: Web3Provider;
    yearnSdk: YearnSdk;
    config: Config;
  }) {
    this.transactionService = transactionService;
    this.web3Provider = web3Provider;
    this.config = config;
    const { GRAPH_API_URL } = getConfig();
    this.graphUrl = GRAPH_API_URL || 'https://api.thegraph.com';
  }

  public async getCreditLines(params: GetCreditLinesProps): Promise<CreditLine[]> {
    // graphURL
    return [];
  }
}
