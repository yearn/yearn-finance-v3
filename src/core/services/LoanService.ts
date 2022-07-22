import {
  LoanService,
  YearnSdk,
  TokenDynamicData,
  Loan,
  ApproveProps,
  TransactionService,
  Web3Provider,
  Balance,
  Token,
  Integer,
  Config,
  Network,
  GetLoansProps,
} from '@types';

export class LoanServiceImpl implements LoanService {
  private graphURL: string;
  private web3Provider: Web3Provider;
  private transactionService: TransactionService;
  private config: Config;

  constructor({
    graphURL,
    transactionService,
    yearnSdk,
    web3Provider,
    config,
  }: {
    graphURL: string;
    transactionService: TransactionService;
    web3Provider: Web3Provider;
    yearnSdk: YearnSdk;
    config: Config;
  }) {
    this.transactionService = transactionService;
    this.web3Provider = web3Provider;
    this.config = config;
    this.graphURL = graphURL;
  }

  public async getLoans(params: GetLoansProps): Promise<Loan[]> {
    // graphURL
    return [];
  }
}
