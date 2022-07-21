import styled from 'styled-components';

import { device } from '@themes/default';
import { ViewContainer } from '@components/app';

const StyledViewContainer = styled(ViewContainer)`
  display: grid;
  grid-auto-rows: min-content;
  padding: ${({ theme }) => theme.card.paddingVariant};
  font-size: 1.6rem;
  line-height: 2.8rem;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.texts};
  border-radius: ${({ theme }) => theme.globalRadius};

  article {
    margin: 0 auto;
  }

  p {
    max-width: 60rem;
  }

  p + p {
    margin-top: 4rem;
  }

  @media ${device.mobile} {
    padding: ${({ theme }) => theme.card.padding};
    p {
      width: 100%;
    }
  }
`;

const Header = styled.h2`
  color: ${(props) => props.theme.colors.titles};
  font-size: 2rem;
  font-weight: 700;
  margin: 4rem 0 2rem 0;
  padding: 0;
  &:first-child {
    margin-top: 0;
  }
`;

const StyledLink = styled.a`
  white-space: initial;
  text-decoration: underline;
  color: inherit;
`;

export const Disclaimer = () => {
  return (
    <StyledViewContainer>
      <article>
        <Header>Terms</Header>
        <p>
          When used on this website, the terms “debt,” “lend,” “borrow,” “collateral”, “credit,” “leverage,” “bank”,
          “borrow”, yield”, “invest” and other similar terms are not meant to be interpreted literally. Rather, such
          terms are being used to draw rough, fuzzy-logic analogies between the heavily automated and mostly
          deterministic operations of a decentralized-finance smart contract system and the discretionary performance of
          traditional-finance transactions by people.
        </p>
        <p>
          For example, ‘debt’ is a legally enforceable promise from a debtor to a creditor to pay an interest rate and
          eventually repay the principal. Therefore, ‘debt’ cannot exist without legal agreements and cannot be enforced
          without courts of law.{' '}
          <u>
            By contrast, with the Iron Bank, there are no legal agreements, promises of payment or courts of law, and
            therefore there are no debts, loans or other traditional finance transactions involved.
          </u>
        </p>
        <p>
          Instead, the Iron Bank consists of software (including embedded game-theoretic incentives and assumptions)
          through which people can share their tokens with other people or smart contract systems and,{' '}
          <i>
            under normal and expected conditions and subject to various assumptions regarding the behavioral effects of
            incentives, <u>probably</u> get their tokens back eventually, plus extra tokens, most of the time or in most
            cases.
          </i>{' '}
          Unlike in traditional lending, the ‘lender’s’ financial return does not depend primarily on the
          creditworthiness, solvency or financial skill of the ‘borrower’ or on legal nuances such as the perfection of
          liens or the priority of creditor claims in a bankruptcy--it depends primarily on the incentive model assumed
          by the software design and how reliably the software implements that model. Unlike a debtor, people who
          ‘borrow’ tokens from the Iron Bank smart contract system are not required to and have not promised to pay the
          tokens back; if the ‘borrowers’ never pay the tokens back, no promise has been broken, no legal agreement has
          been breached and the token ‘lenders’ cannot sue the ‘borrowers’ to get their tokens back. Instead, by not
          repaying the borrowed tokens, the token ‘borrowers’ merely demonstrate either that they lacked sufficient
          incentive to want to do so--for example, because their smart-contract-bound ‘collateral’ was worth much less
          than the ‘borrowed’ tokens--or that a technical issue--such as congestion of Ethereum--prevented them from
          doing so. Regardless, the ‘borrowers’ do not have an obligation to repay tokens when they do not want to or
          cannot do so, and there is no legal remedy for damaged ‘lenders’ when insufficient incentives or technical
          problems result in a token shortfall.
        </p>
        <Header>Deposit</Header>
        <p>
          When the Iron Bank or Vaults are used to ‘lend’ or ‘deposit’ tokens into a third-party smart-contract system,
          the situation is even less like traditional debt: the ‘borrowing’ smart contract has not posted ‘collateral’
          and could malfunction or suffer a loss that results in complete or partial failure to return the ‘borrowed’
          tokens. In this case, the token ‘lenders’ do not have a contractual remedy against the smart contract
          ‘borrower’ or its creators--the third-party smart contract is not a person, is usually not under the full
          control of any person or persons and may be impossible to pause or reverse. A malfunctioning, exploited or
          underperforming smart contract cannot be forced (in court or otherwise) to pay the ‘borrowed’ tokens back.
        </p>
        <Header>Rate</Header>
        <p>
          The stated APR or APY for a given token, vault or strategy (the 'Rate') is denominated in terms of a specific
          relevant token, not in terms of U.S. Dollars or other fiat currencies. Each Rate is a forward-looking
          projection based on a good faith belief of how to reasonably project results over the relevant period, but
          such belief is subject to numerous assumptions, risks and uncertainties (including smart contract security
          risks and third-party actions) which could result in a materially different (lower or higher)
          token-denominated APR or APY. Rates are not offers, promises, agreements, guarantees or undertakings on the
          part of any person or group of persons, but depend primarily on the results of operation of smart contracts
          and other autonomous or semi-autonomous systems (including third-party systems) and how third parties interact
          with those systems after the time of your deposit. Even if a particular projected Rate is achieved, you may
          still suffer a financial loss in fiat-denominated terms if the fiat-denominated value of the relevant tokens
          (your deposit and any tokens allocated or distributed to you pursuant to the Rate) declines during the deposit
          period. APRs and APYs are not interest rates being paid on a debt.
        </p>
        <Header>Risk</Header>
        <p>
          Thus, the transactions you can effect through the Iron Bank, Vaults and other Debt DAO decentralized finance
          systems, while superficially similar to traditional financial transactions in some ways, are in fact very
          different. DeFi and TradFi each have unique costs and benefits, risks and protection mechanisms.{' '}
          <u>
            Please bear this fact in mind when using this website, and do not use DebtDAO, the Debt DAO vaults, the Iron
            Bank or any other system described on this website without a sufficient understanding of their unique risks
            and how they differ from traditional financial transactions.
          </u>{' '}
          The only way to fully understand such risks is to have a strong understanding of the relevant technical
          systems and the incentive design mechanisms they embody--we strongly encourage you to review DebtDAO’s{' '}
          <StyledLink href="https://docs.yearn.finance" target="_blank">
            technical documentation
          </StyledLink>{' '}
          and{' '}
          <StyledLink href="https://github.com/yearn" target="_blank">
            code
          </StyledLink>{' '}
          before use.
        </p>
      </article>
    </StyledViewContainer>
  );
};
