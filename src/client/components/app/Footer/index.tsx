import styled from 'styled-components';

import { AlchemyCertified } from '@assets/images';
import {
  Logo,
  SeparatorLine,
  Icon,
  MediumIcon,
  Link,
  TwitterIcon,
  DiscordIcon,
  GithubIcon,
  TelegramIcon,
  BugIcon,
} from '@components/common';

interface FooterProps {
  className?: string;
}

const StyledFooter = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.shade100};
  padding: 0 ${({ theme }) => theme.footer.padding};
  padding-top: ${({ theme }) => theme.footer.paddingTop};
  padding-bottom: ${({ theme }) => theme.footer.paddingBottom};
`;

const Sections = styled.div`
  display: flex;
`;

const Section = styled.div`
  display: grid;
  grid-auto-rows: minmax(min-content, max-content);
  grid-gap: 2rem;
  font-size: 1.4rem;
  font-weight: 400;
  padding: 0 6.5rem;
`;

const SocialSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  flex: 1;
`;

const SocialIcons = styled.div`
  --icon-size: 3.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, var(--icon-size));

  align-items: center;
  margin-top: 10rem;
  gap: 1rem;
  width: 100%;
`;

const StyledIconLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size);
  height: var(--icon-size);
  border-radius: 100%;
  background-color: ${({ theme }) => theme.colors.shade40};
  color: ${({ theme }) => theme.colors.shade30};
  transition: filter 200ms ease-in-out;

  &:hover {
    filter: brightness(120%);
  }
`;

const Copyright = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.shade20};

  img {
    width: 18.6rem;
  }
`;

const socialLinks = [
  {
    link: 'https://medium.com/iearn',
    icon: MediumIcon,
  },
  {
    link: 'https://twitter.com/iearnfinance',
    icon: TwitterIcon,
  },
  {
    link: 'https://discord.com/invite/6PNv2nF/',
    icon: DiscordIcon,
  },
  {
    link: 'https://github.com/yearn/yearn-finance.git',
    icon: GithubIcon,
  },
  {
    link: 'https://www.google.com',
    icon: TelegramIcon,
  },
  {
    link: 'https://www.google.com',
    icon: BugIcon,
  },
];

export const Footer = ({ className }: FooterProps) => {
  const socialIcons = (
    <SocialIcons>
      {socialLinks.map((social) => {
        return (
          <StyledIconLink href={social.link}>
            <Icon src={social.icon} />
          </StyledIconLink>
        );
      })}
    </SocialIcons>
  );

  return (
    <StyledFooter className={className}>
      <Sections>
        <SocialSection>
          <Logo full />

          {socialIcons}
        </SocialSection>

        <Section>
          <strong>Versions:</strong>
          <Link>v1</Link>
          <Link>v2</Link>
          <Link>v3</Link>
        </Section>
        <SeparatorLine className="vertical" />
        <Section>
          <Link>Documentation</Link>
          <Link>Github</Link>
          <Link>Labs</Link>
        </Section>
        <Section>
          <Link>Governance</Link>
          <Link>Voting</Link>
          <Link>Security</Link>
        </Section>
      </Sections>

      <SeparatorLine />

      <Copyright>
        <span>Copyright © yearn 2021. All rights reserved. | Private Policy </span>
        <img src={AlchemyCertified} alt="Alchemy Certified" />
      </Copyright>
    </StyledFooter>
  );
};
