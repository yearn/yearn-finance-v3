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
  {
    link: 'https://docs.yearn.finance',
    name: 'docs',
  },
  {
    link: 'https://gov.yearn.finance',
    name: 'gov',
  },
  {
    link: 'https://blog.yearn.finance/',
    name: 'blog',
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
    link: 'https://github.com/yearn/yearn-security/blob/master/SECURITY.md',
    name: 'security',
  },
];

const socialLinks = [
  {
    link: 'https://twitter.com/iearnfinance',
    icon: TwitterIcon,
  },
  {
    link: 'https://reddit.com/r/yearn_finance',
    icon: RedditIcon,
  },
  {
    link: 'https://discord.yearn.finance',
    icon: DiscordIcon,
  },
  {
    link: 'https://medium.com/iearn',
    icon: MediumIcon,
  },
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
  color: ${({ theme }) => theme.colors.icons.variant};
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

  @media ${device.tablet} {
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
          <StyledLink href={footerLink.link} key={footerLink.name} target="_blank">
            {t(`footer.links.${footerLink.name}`)}
          </StyledLink>
        ))}
      </LinkSection>

      <SocialSection>
        {socialLinks.map((social, index) => (
          <StyledIconLink href={social.link} target="_blank" key={index}>
            <StyledIcon Component={social.icon} />
          </StyledIconLink>
        ))}
      </SocialSection>
    </StyledFooter>
  );
};
