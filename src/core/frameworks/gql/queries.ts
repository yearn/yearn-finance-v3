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
    arbiter
    borrower {
      id
    }
  }
`;

const BASE_CREDIT_FRAGMENT = gql`
  fragment BaseCreditFrag on Position {
    id
    status
    principal
    deposit
    dRate
    fRate
    token {
      id
    }
  }
`;

const LINE_PAGE_CREDIT_FRAGMENT = gql`
  ${TOKEN_FRAGMENT}
  fragment LinePageCreditFrag on Position {
    id
    status
    lender {
      id
    }
    deposit
    principal
    interestRepaid
    interestAccrued
    dRate
    fRate
    token {
      ...TokenFrag
    }
  }
`;

// lewv = line event with value
const LINE_EVENT_FRAGMENT = gql`
  ${TOKEN_FRAGMENT}
  fragment LineEventFrag on LineEventWithValue {
    id
    __typename
    timestamp
    amount
    value
    position {
      id
      token {
        ...TokenFrag
      }
    }
  }
`;

// Spigot Frags
const BASE_SPIGOT_FRAGMENT = gql`
  fragment BaseSpigotFrag on Spigot {
    id
    active
    contract
    startTime
    totalVolumeUsd
  }
`;

const SPIGOT_SUMMARY_FRAGMENT = gql`
  ${TOKEN_FRAGMENT}
  fragment SpigotSummaryFrag on SpigotRevenueSummary {
    id

    totalVolumeUsd
    timeOfFirstIncome
    timeOfLastIncome

    token {
      ...TokenFrag
    }
  }
`;

const SPIGOT_EVENT_FRAGMENT = gql`
  ${TOKEN_FRAGMENT}
  fragment SpigotEventFrag on SpigotControllerEvent {
    ... on ClaimRevenueEvent {
      id
      __typename
      timestamp
      revenueToken {
        ...TokenFrag
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
  ${BASE_LINE_FRAGMENT}
  ${LINE_PAGE_CREDIT_FRAGMENT}
  ${LINE_EVENT_FRAGMENT}

  ${BASE_SPIGOT_FRAGMENT}
  ${SPIGOT_SUMMARY_FRAGMENT}
  ${SPIGOT_EVENT_FRAGMENT}
  ${ESCROW_FRAGMENT}

  query getLinePage($id: ID!) {
    lineOfCredit(id: $id) {
      ...BaseLineFrag

      positions {
        ...LinePageCreditFrag
      }

      events(first: 20) {
        ...LineEventFrag
      }

      spigot {
        id
        spigots {
          ...BaseSpigotFrag
        }

        summaries {
          ...SpigotSummaryFrag
        }
        events(first: 20) {
          ...SpigotEventFrag
        }
      }
      escrow {
        ...EscrowFrag
      }
    }
  }
`;

export const GET_LINE_PAGE_AUX_QUERY = gql`
  ${LINE_EVENT_FRAGMENT}
  ${SPIGOT_EVENT_FRAGMENT}

  query getLinePageAux($id: ID) {
    lineOfCredit(id: $id) {
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
  ${SPIGOT_SUMMARY_FRAGMENT}
  ${TOKEN_FRAGMENT}

  query getLines($first: Int, $orderBy: String, $orderDirection: String) {
    lineOfCredits(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
      ...BaseLineFrag

      positions {
        ...BaseCreditFrag
      }

      escrow {
        ...EscrowFrag
      }

      spigot {
        id
        summaries {
          ...SpigotSummaryFrag
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
