import { gql } from '@apollo/client';

// FRAGMENTS

// Misc Frags

const TOKEN_FRAGMENT = gql`
  fragment TokenFrag on Token {
    id
    name
    symbol
    decimals
    lastPriceUSD
  }
`;

// Line of Credit Frags

const BASE_LINE_FRAGMENT = gql`
  fragment BaseLineFrag on LineOfCredit {
    id
    end
    type
    start
    status
    borrower {
      id
    }
  }
`;

const LINE_PAGE_CREDIT_FRAGMENT = gql`
  fragment LinePageCreditFrag on Credit {
    lender
    deposit
    principal
    interestRepaid
    interestAccrued
    drawnRate
    token {
      symbol
    }
  }
`;

// lewv = line event with value
const CREDIT_EVENT_FRAGMENT = gql`
  fragment lewv on LineEvent {
    amount
    value
  }
  fragment LineEventFrag on LineEvent {
    __typename
    timestamp
    credit {
      id
    }
    ... on BorrowEvent {
      ...lewv
    }
    ... on DefaultEvent {
      ...lewv
    }
    ... on LiquidateEvent {
      ...lewv
    }
    ... on RepayInterestEvent {
      ...lewv
    }
    ... on AddCollateralEvent {
      ...lewv
    }
    ... on RepayPrincipalEvent {
      ...lewv
    }
    ... on WithdrawProfitEvent {
      ...lewv
    }
    ... on WithdrawDepositEvent {
      ...lewv
    }
    ... on InterestAccruedEvent {
      ...lewv
    }
    ... on RemoveCollateralEvent {
      ...lewv
    }
    ... on SetRatesEvent {
      drawnRate
      facilityRate
    }
  }
`;

// Spigot Frags
const BASE_SPIGOT_FRAGMENT = gql`
  fragment BaseSpigotFrag on Spigot {
    active
    contract
    startTime
    token {
      symbol
    }
  }
`;

const SPIGOT_EVENT_FRAGMENT = gql`
  fragment SpigotEventFrag on SpigotEvent {
    ... on ClaimRevenueEvent {
      __typename
      timestamp
      revenueToken {
        symbol
        lastPriceUSD
      }
      escrowed
      netIncome
      value
    }
  }
`;

// Escrow Frags

const ESCROW_FRAGMENT = gql`
  fragment EscrowFrag on Escrow {
    cratio
    minCRatio
    collateralValue
  }
`;

const ESCROW_EVENT_FRAGMENT = gql`
  fragment EscrowEventFrag on EscrowEvent {
    __typename
    timestamp
    ... on AddCollateralEvent {
      amount
      value
    }
    ... on RemoveCollateralEvent {
      amount
      value
    }
  }
`;

// QUERIES
// ave to add fragment vars before running your query for frags to be available inside
export const GET_LINE_QUERY = gql`
  ${BASE_LINE_FRAGMENT}
  query getLine($id: ID!) {
    lineOfCredits(id: $id) {
      ...BaseLineFrag
      escrow {
        id
        collateralValue
      }
      spigotController {
        id
      }
    }
  }
`;

// use deposit > 0 for all non-closed positions
export const GET_USER_POSITIONS_QUERY = gql`
  ${BASE_LINE_FRAGMENT}
  query getUserPositions($id: ID!) {
    borrower(id: $id) {
      debts(where: { deposit_gt: 0 }) {
        ...BaseLineFrag
      }
    }
    lender(id: $id) {
      credits(where: { deposit_gt: 0 }) {
        ...BaseLineFrag
      }
    }
  }
`;

export const GET_LINE_PAGE_QUERY = gql`
  ${TOKEN_FRAGMENT}
  ${ESCROW_FRAGMENT}
  ${BASE_LINE_FRAGMENT}
  ${BASE_SPIGOT_FRAGMENT}
  ${CREDIT_EVENT_FRAGMENT}
  ${SPIGOT_EVENT_FRAGMENT}
  ${ESCROW_EVENT_FRAGMENT}
  ${LINE_PAGE_CREDIT_FRAGMENT}

  query getLinePage($id: ID!) {
    lineOfCredits(id: $id) {
      ...BaseLineFrag

      credits {
        ...LinePageCreditFrag
        events(first: 5) {
          ...LineEventFrag
        }
      }

      escrow {
        ...EscrowFrag
        deposits {
          timestamp
          amount
          enabled
          token {
            ...TokenFrag
          }
        }
        events(first: 3) {
          ...EscrowEventFrag
        }
      }

      spigotController {
        spigots {
          ...BaseSpigotFrag
          events(first: 3) {
            ...SpigotEventFrag
          }
        }
      }
    }
  }
`;

export const GET_LINES_QUERY = gql`
  ${BASE_LINE_FRAGMENT}

  query getLines($first: Int, $orderBy: String, $orderDirection: String) {
    lineOfCredits(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
      ...BaseLineFrag
      escrow {
        id
        collateralValue
      }
      spigot {
        id
      }
    }
  }
`;

export const GET_SPIGOT_QUERY = gql`
  ${BASE_SPIGOT_FRAGMENT}

  query getSpigot($id: ID!) {
    ...BaseSpigotFrag
  }
`;
