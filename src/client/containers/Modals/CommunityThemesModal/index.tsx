import { FC } from 'react';
import styled from 'styled-components';

import { getConfig } from '@config';
import { useAppDispatch, useAppSelector } from '@hooks';
import { ThemeActions } from '@store';
import { getTheme } from '@themes';
import { Theme } from '@types';

import { ThemeBox } from '@components/app';
import { Card, Modal } from '@components/common';

const CustomThemesList = styled(Card)`
  display: flex;
  flex: 1;
  background-color: ${({ theme }) => theme.colors.surface};
  margin-top: 1.2rem;
`;

const StyledCommunityThemesModal = styled(Modal)`
  width: 38.5rem;
`;
export interface CommunityThemesModalProps {
  onClose: () => void;
}

export const CommunityThemesModal: FC<CommunityThemesModalProps> = ({ onClose, ...props }) => {
  const dispatch = useAppDispatch();
  const { AVAILABLE_CUSTOM_THEMES, SUPPORTED_LANGS } = getConfig();

  const currentTheme = useAppSelector(({ theme }) => theme.current);
  const changeTheme = (theme: Theme) => dispatch(ThemeActions.changeTheme({ theme }));

  return (
    <StyledCommunityThemesModal onClose={onClose} {...props}>
      Custom Theme Gallery
      <CustomThemesList>
        {AVAILABLE_CUSTOM_THEMES.map((theme: Theme, index) => (
          <ThemeBox
            themePallete={getTheme(theme)}
            name={theme}
            key={index}
            selected={theme === currentTheme}
            onClick={() => changeTheme(theme)}
          />
        ))}
      </CustomThemesList>
    </StyledCommunityThemesModal>
  );
};
