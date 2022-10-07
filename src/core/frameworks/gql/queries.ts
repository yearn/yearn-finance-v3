import { gql } from '@apollo/client';

// FRAGMENTS

// Misc Frags

const TOKEN_FRAGMENT = gql`
  fragment TokenFrag on Token {
    id
    symbol
    decimals
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

const BASE_CREDIT_FRAGMENT = gql`
  fragment BaseCreditFrag on Credit {
    id
    principal
    deposit
    dRate
    token {
      id
      symbol
      decimals
    }
  }
`;

const LINE_PAGE_CREDIT_FRAGMENT = gql`
  fragment LinePageCreditFrag on Credit {
    id
    lender
    deposit
    principal
    interestRepaid
    interestAccrued
    dRate
    fRate
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
      dRate
      fRate
    }
  }
`;

// Spigot Frags
const BASE_SPIGOT_FRAGMENT = gql`
  ${TOKEN_FRAGMENT}
  fragment BaseSpigotFrag on Spigot {
    active
    contract
    startTime
    token {
      ...TokenFrag
    }
  }
`;

const SPIGOT_EVENT_FRAGMENT = gql`
  fragment SpigotEventFrag on SpigotEvent {
    ... on ClaimRevenueEvent {
      __typename
      timestamp
      revenueToken {
        id
      }
      escrowed
      netIncome
      value
    }
  }
`;

// Escrow Frags

const ESCROW_FRAGMENT = gql`
  ${TOKEN_FRAGMENT}
  fragment EscrowFrag on Escrow {
    id
    minCRatio
    deposits {
      amount
      enabled
      token {
        ...TokenFrag
      }
    }
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

      lines {
        ...LinePageCreditFrag
      }
      events(first: 20) {
        ...LineEventFrag
      }

      escrow {
        ...EscrowFrag
      }

      spigot {
        id
        spigots {
          ...BaseSpigotFrag
        }
        events(first: 20) {
          ...SpigotEventFrag
        }
      }
    }
  }
`;

export const GET_LINE_PAGE_AUX_QUERY = gql`
  query getLinePageAux($id: ID) {
    lineOfCredit(id: $id) {
      lines {
        dRate
      }

      events(first: 20) {
        ...LineEventFrag
      }

      spigot {
        events(first: 20) {
          ...SpigotEventFrag
        }
      }
    }
  }
`;

export const GET_LINES_QUERY = gql`
  ${BASE_LINE_FRAGMENT}
  ${BASE_CREDIT_FRAGMENT}
  ${ESCROW_FRAGMENT}
  ${TOKEN_FRAGMENT}

  query getLines($first: Int, $orderBy: String, $orderDirection: String) {
    lineOfCredits(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
      ...BaseLineFrag
      credits: lines {
        ...BaseCreditFrag
      }
      escrow {
        ...EscrowFrag
      }
      spigot {
        id
        summaries {
          token {
            ...TokenFrag
          }
          totalVolumeUsd
          timeOfFirstIncome
          timeOfLastIncome
        }
      }
    }
  }
`;

// TODO
// export const GET_HOMEPAGE_LINES_QUERY = gql`
//   ${BASE_LINE_FRAGMENT}
//   ${BASE_CREDIT_FRAGMENT}

//   query getHomepageLines() {
//     newest: lineOfCredits(first: 5, orderBy: start, orderDirection: desc) {
//       ...BaseLineFrag
//     }
//   }
// `;

export const GET_SPIGOT_QUERY = gql`
  ${BASE_SPIGOT_FRAGMENT}

  query getSpigot($id: ID!) {
    spigotController(id: $id) {
      ...BaseSpigotFrag
    }
  }
`;
