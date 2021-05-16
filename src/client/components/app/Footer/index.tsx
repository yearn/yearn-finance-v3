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
import { device } from '@themes/default';
import { useAppTranslation } from '@hooks';

interface FooterProps {
  className?: string;
}

const StyledFooter = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${({ theme }) => theme.oldColors.shade100};
  padding: 0 ${({ theme }) => theme.footer.padding};
  padding-top: ${({ theme }) => theme.footer.paddingTop};
  padding-bottom: ${({ theme }) => theme.footer.paddingBottom};

  @media ${device.tablet} {
    .footer-sections {
      display: grid;
      grid-gap: 4rem;
    }

    .social-section {
      flex: 1 100%;
      order: 5;

      .social-icons {
        margin-top: 3rem;
      }
    }

    .link-section {
      grid-gap: 7rem;

      .separator-line {
        margin: 0;
      }
    }
  }

  @media ${device.mobile} {
    padding: 4rem;

    .footer-sections {
      grid-gap: 3.3rem;
    }

    .social-section {
      .logo {
        display: none;
      }
      .social-icons {
        margin-top: 0;
      }
    }

    .social-section {
      margin-top: 0;
    }

    .link-section {
      grid-template-columns: 1fr;
      grid-gap: 2rem;

      .separator-line {
        display: none;
      }
    }

    & > .separator-line {
      margin-top: 3rem;
      margin-bottom: 2rem;
    }

    .copyright {
      flex-direction: column;
      align-items: flex-start;
      img {
        order: -1;
      }
      span {
        margin-top: 1.7rem;
      }
    }
  }
`;

const FooterSections = styled.div`
  display: flex;
`;

const LinkSection = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 3fr 3fr;
  grid-gap: 11rem;
  justify-content: space-between;
  flex: 1;
`;

const SocialSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  flex: 1;
`;

const Section = styled.div`
  display: grid;
  grid-auto-rows: minmax(min-content, max-content);
  grid-gap: 2rem;
  font-size: 1.4rem;
  font-weight: 400;
`;

const StyledLink = styled(Link)`
  &:before {
    content: '>';
    color: grey;
    margin-right: 0.78rem;
  }
`;

const SocialIcons = styled.div`
  --icon-size: 3.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, var(--icon-size));

  align-items: center;
  margin-top: 10rem;
  grid-gap: 1rem;
  width: 100%;
`;

const StyledIconLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size);
  height: var(--icon-size);
  border-radius: 100%;
  background-color: ${({ theme }) => theme.oldColors.shade40};
  color: ${({ theme }) => theme.oldColors.shade30};
  transition: filter 200ms ease-in-out;

  &:hover {
    filter: brightness(120%);
  }
`;

const StyledIcon = styled(Icon)`
  fill: ${({ theme }) => theme.oldColors.shade30};
`;

const Copyright = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.oldColors.shade20};

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
  const { t } = useAppTranslation('common');

  const socialIcons = (
    <SocialIcons className="social-icons">
      {socialLinks.map((social, index) => {
        return (
          <StyledIconLink href={social.link} target="_blank" key={index}>
            <StyledIcon Component={social.icon} />
          </StyledIconLink>
        );
      })}
    </SocialIcons>
  );

  return (
    <StyledFooter className={className}>
      <FooterSections className="footer-sections">
        <SocialSection className="social-section">
          <Logo full className="logo" />
          {socialIcons}
        </SocialSection>

        <LinkSection className="link-section">
          <Section>
            <strong>{t('footer.links.versions')}</strong>
            <StyledLink target="_blank" href="https://v1.yearn.finance">
              {t('footer.links.v1')}
            </StyledLink>
            <StyledLink target="_blank" href="https://v2.yearn.finance">
              {t('footer.links.v2')}
            </StyledLink>
          </Section>

          <SeparatorLine className="separator-line vertical" />

          <Section>
            <StyledLink target="_blank" href="https://docs.yearn.finance">
              {t('footer.links.documentation')}
            </StyledLink>
            <StyledLink target="_blank" href="https://github.com/yearn">
              {t('footer.links.github')}
            </StyledLink>
            <StyledLink target="_blank" href="https://yearn.fi">
              {t('footer.links.labs')}
            </StyledLink>
          </Section>

          <Section>
            <StyledLink target="_blank" href="https://gov.yearn.finance">
              {t('footer.links.governance')}
            </StyledLink>
            <StyledLink target="_blank" href="https://snapshot.org/#/ybaby.eth">
              {t('footer.links.voting')}
            </StyledLink>
            <StyledLink target="_blank" href="https://github.com/yearn/yearn-security">
              {t('footer.links.security')}
            </StyledLink>
          </Section>
        </LinkSection>
      </FooterSections>

      <SeparatorLine className="separator-line" />

      <Copyright className="copyright">
        <span>{t('footer.copyright')}</span>
        <img src={AlchemyCertified} alt="Alchemy Certified" />
      </Copyright>
    </StyledFooter>
  );
};
