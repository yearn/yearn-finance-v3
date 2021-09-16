import styled from 'styled-components';

import { ReactComponent as AlchemyCertified } from '@assets/images/alchemy-certified.svg';

import { Icon, MediumIcon, Link, TwitterIcon, DiscordIcon, GithubIcon, TelegramIcon } from '@components/common';
import { useAppTranslation } from '@hooks';
import { device } from '@themes/default';

interface FooterProps {
  className?: string;
}

const footerLinks = [
  {
    link: 'https://gov.yearn.finance',
    name: 'gov',
  },
  {
    link: 'https://docs.yearn.finance',
    name: 'docs',
  },
  {
    link: 'https://github.com/yearn/yearn-protocol/blob/develop/SECURITY.md',
    name: 'security',
  },
  // {
  //   link: 'https://v1.yearn.finance',
  //   name: 'v1',
  // },
  // {
  //   link: 'https://yearn.finance',
  //   name: 'v2',
  // },
  {
    link: '/disclaimer',
    name: 'disclaimer',
  },
];

const socialLinks = [
  {
    link: 'https://twitter.com/iearnfinance',
    icon: TwitterIcon,
  },
  {
    link: 'https://github.com/yearn',
    icon: GithubIcon,
  },
  {
    link: 'https://discord.yearn.finance',
    icon: DiscordIcon,
  },
  {
    link: 'https://medium.com/iearn',
    icon: MediumIcon,
  },
  {
    link: 'https://t.me/yearnfinance',
    icon: TelegramIcon,
  },
];

const SocialSection = styled.div`
  --icon-size: 3rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, var(--icon-size));
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  min-width: calc(var(--icon-size) * ${socialLinks.length} / 2 + 3rem);
`;

const LinkSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  column-gap: 4rem;
  row-gap: 1rem;
  flex: 1;
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.secondary};
`;

const StyledLink = styled(Link)`
  padding: 1rem;
  margin: -1rem;
`;

const StyledIconLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
`;

const StyledIcon = styled(Icon)`
  width: var(--icon-size);
  height: var(--icon-size);
`;

const LogoSection = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const AlchemyLogo = styled(AlchemyCertified)`
  width: 17.2rem;
  fill: ${({ theme }) => theme.colors.secondary};
`;

const StyledFooter = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  gap: 1rem;
  row-gap: 1.5rem;
  padding: 4rem;
  border-radius: ${({ theme }) => theme.globalRadius};
  background-color: ${({ theme }) => theme.colors.surface};
  max-width: ${({ theme }) => theme.globalMaxWidth};
  margin-top: ${({ theme }) => theme.layoutPadding};

  @media ${device.tablet} {
    grid-template-columns: 1fr;
    padding: 2rem;

    ${LinkSection},
    ${LogoSection} {
      justify-content: flex-start;
    }
  }

  ${StyledLink},
  ${StyledIconLink} {
    transition: filter 200ms ease-in-out;

    &:hover {
      filter: brightness(120%);
    }
  }
`;

const socialIcons = (
  <SocialSection>
    {socialLinks.map((social, index) => {
      return (
        <StyledIconLink href={social.link} target="_blank" key={index}>
          <StyledIcon Component={social.icon} />
        </StyledIconLink>
      );
    })}
  </SocialSection>
);

export const Footer = ({ className }: FooterProps) => {
  const { t } = useAppTranslation('common');

  return (
    <StyledFooter className={className}>
      {socialIcons}

      <LinkSection>
        {footerLinks.map((footerLink) => {
          return (
            <StyledLink href={footerLink.link} key={footerLink.name}>
              {t(`footer.links.${footerLink.name}`)}
            </StyledLink>
          );
        })}
      </LinkSection>

      <LogoSection>
        <AlchemyLogo />
      </LogoSection>
    </StyledFooter>
  );
};
