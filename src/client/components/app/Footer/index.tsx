import styled from 'styled-components';

import { ReactComponent as AlchemyCertified } from '@assets/images/alchemy-certified.svg';

import { Icon, MediumIcon, Link, TwitterIcon, DiscordIcon, GithubIcon, TelegramIcon } from '@components/common';
import { device } from '@themes/default';
import { useAppTranslation } from '@hooks';

interface FooterProps {
  className?: string;
}

const socialLinks = [
  {
    link: 'https://twitter.com/iearnfinance',
    icon: TwitterIcon,
  },
  {
    link: 'https://github.com/yearn/yearn-finance.git',
    icon: GithubIcon,
  },
  {
    link: 'https://discord.com/invite/6PNv2nF/',
    icon: DiscordIcon,
  },
  {
    link: 'https://medium.com/iearn',
    icon: MediumIcon,
  },
  {
    link: 'https://www.google.com',
    icon: TelegramIcon,
  },
];

const StyledFooter = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  gap: 2rem;
  flex-wrap: wrap;
`;

const SocialSection = styled.div`
  --icon-size: 3rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, var(--icon-size));
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  flex: 1;
  min-width: calc(var(--icon-size) * ${socialLinks.length} + 3rem);
`;

const StyledIconLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  transition: filter 200ms ease-in-out;

  &:hover {
    filter: brightness(120%);
  }
`;

const StyledIcon = styled(Icon)`
  width: var(--icon-size);
  height: var(--icon-size);
`;

const AlchemyLogo = styled(AlchemyCertified)`
  width: 100%;
  fill: ${({ theme }) => theme.colors.onBackground};
`;

const Copyright = styled.div`
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  font-weight: bold;
  font-size: 1.4rem;

  span {
    margin-top: 0.7rem;
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

      <Copyright>
        <AlchemyLogo />
        <span>{t('footer.copyright')}</span>
      </Copyright>
    </StyledFooter>
  );
};
