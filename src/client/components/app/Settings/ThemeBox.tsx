import styled, { DefaultTheme } from 'styled-components';
import { Theme } from '@types';

import { useAppTranslation } from '@hooks';

const StyledThemeBox = styled.div<{ themePallete: DefaultTheme; selected?: boolean }>`
  display: flex;
  background-color: ${(props) => props.themePallete.colors.background};
  color: ${(props) => props.themePallete.colors.primaryVariant};
  min-width: 10rem;
  width: 24rem;
  height: 12rem;
  border-radius: 0.8rem;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
  padding: 1.2rem;
  user-select: none;

  ${(props) =>
    props.selected &&
    `
    cursor: default;
    border-color: ${props.theme.colors.surface};
  `};

  * {
    border-radius: 0.4rem;
  }

  .themebox-sidebar {
    width: 3.2rem;
    height: 100%;
    background-color: ${(props) => props.themePallete.colors.primary};
    margin-right: 0.8rem;
  }
  .themebox-content {
    display: grid;
    grid-auto-rows: auto 1fr;
    grid-gap: 0.8rem;
    flex: 1;
    height: 100%;

    .content-portfolio {
      display: flex;
      align-items: center;
      padding: 0 1rem;
      background: ${(props) => props.themePallete.colors.secondaryVariantA};
      height: 3.2rem;
      font-size: 1.2rem;
    }
    .content-card {
      background: ${(props) => props.themePallete.colors.surface};
      flex: 1;
    }
  }
`;

interface ThemeBoxProps {
  themePallete: DefaultTheme;
  name: Theme;
  selected?: boolean;
  onClick?: () => void;
}

export const ThemeBox = ({ themePallete, name, selected, onClick }: ThemeBoxProps) => {
  const { t } = useAppTranslation('common');

  return (
    <StyledThemeBox themePallete={themePallete} selected={selected} onClick={onClick}>
      {selected}
      <div className="themebox-sidebar"></div>
      <div className="themebox-content">
        <div className="content-portfolio">{t(`themes.${name}`)}</div>
        <div className="content-card"></div>
      </div>
    </StyledThemeBox>
  );
};
