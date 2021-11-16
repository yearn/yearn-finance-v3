import { FC, useState } from 'react';
import styled from 'styled-components';

import { getConfig } from '@config';
import { useAppDispatch, useAppSelector } from '@hooks';
import { ThemeActions } from '@store';
import { getTheme } from '@themes';
import { Theme } from '@types';

import { ThemeBox } from '@components/app';
import { Card, Modal, Tabs, Tab, TabPanel } from '@components/common';

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

  const [selectedTab, setSelectedTab] = useState('community');

  return (
    <StyledCommunityThemesModal header="Custom Theme Gallery" onClose={onClose} {...props}>
      <Tabs value={selectedTab} onChange={setSelectedTab}>
        <Tab value="community">Community</Tab>
        {/* <Tab value="favorites" disabled>
          Favorites
        </Tab> */}
      </Tabs>
      <TabPanel value="community" tabValue={selectedTab}>
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
      </TabPanel>
    </StyledCommunityThemesModal>
  );
};
