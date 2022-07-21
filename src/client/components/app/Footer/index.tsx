import styled from 'styled-components';

import { Icon, MediumIcon, Link, TwitterIcon, DiscordIcon, RedditIcon } from '@components/common';
import { useAppTranslation } from '@hooks';
import { device } from '@themes/default';

interface FooterProps {
  className?: string;
}

const footerLinks = [
  {
    link: '/disclaimer',
    name: 'disclaimer',
  },
  // {
  //   link: 'https://buyback.yearn.finance',
  //   name: 'buyback',
  // },
  {
    link: 'https://docs.debtdao.financee',
    name: 'docs',
  },
  // {
  //   link: 'https://gov.yearn.finance',
  //   name: 'gov',
  // },
  // {
  //   link: 'https://blog.yearn.finance/',
  //   name: 'blog',
  // },
  // {
  //   link: 'https://github.com/yearn/yearn-security/blob/master/SECURITY.md',
  //   name: 'security',
  // },
];

const socialLinks = [
  {
    link: 'https://twitter.com/debtdao',
    icon: TwitterIcon,
    ariaLabel: 'Visit Debt DAO Twitter',
  },
  // {
  //   link: 'https://reddit.com/r/yearn_finance',
  //   icon: RedditIcon,
  //   ariaLabel: 'Visit Debt DAO Reddit',
  // },
  {
    link: 'https://discord.gg/debtdao',
    icon: DiscordIcon,
    ariaLabel: 'Join Debt DAO Discord',
  },
  // {
  //   link: 'https://medium.com/iearn',
  //   icon: MediumIcon,
  //   ariaLabel: 'Visit Debt DAO Medium',
  // },
];

const SocialSectionIconSize = '2.4rem';
const SocialSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, ${SocialSectionIconSize});
  align-items: center;
  justify-content: flex-end;
  grid-gap: ${({ theme }) => theme.layoutPadding};
  width: 100%;
  min-width: calc(${SocialSectionIconSize} * ${socialLinks.length} / 2 + 3rem);
`;

const LinkSection = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: ${({ theme }) => theme.card.padding};
  row-gap: 1rem;
  flex: 1;
  color: ${({ theme }) => theme.colors.icons.text};
`;

const StyledLink = styled(Link)`
  padding: 1rem;
  margin: -1rem;
  font-size: 1.6rem;
`;

const StyledIconLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
`;

const StyledIcon = styled(Icon)`
  width: ${SocialSectionIconSize};
  height: ${SocialSectionIconSize};
  fill: ${({ theme }) => theme.colors.icons.variant};
`;

const StyledFooter = styled.footer`
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  gap: 1rem;
  row-gap: 1.5rem;
  padding: ${({ theme }) => theme.card.padding};
  border-radius: ${({ theme }) => theme.globalRadius};
  max-width: ${({ theme }) => theme.globalMaxWidth};

  @media ${device.desktopS} {
    grid-template-columns: 1fr;
    padding: 2rem;

    ${SocialSection},
    ${LinkSection} {
      justify-content: center;
    }
  }

  ${StyledLink},
  ${StyledIconLink} {
    transition: filter 200ms ease-in-out;
    filter: opacity(100%);

    &:hover {
      filter: opacity(70%);
    }
  }
`;

export const Footer = ({ className }: FooterProps) => {
  const { t } = useAppTranslation('common');

  return (
    <StyledFooter className={className}>
      <LinkSection>
        {footerLinks.map((footerLink) => (
          <StyledLink external to={footerLink.link} key={footerLink.name}>
            {t(`footer.links.${footerLink.name}`)}
          </StyledLink>
        ))}
      </LinkSection>

      <SocialSection>
        {socialLinks.map((social, index) => (
          <StyledIconLink external to={social.link} key={index} aria-label={social.ariaLabel}>
            <StyledIcon Component={social.icon} />
          </StyledIconLink>
        ))}
      </SocialSection>
    </StyledFooter>
  );
};
