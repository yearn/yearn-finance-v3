import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';
import { ThemeActions } from '@store';
import { AVAILABLE_THEMES, getTheme } from '@themes';
import { Theme } from '@types';

import { ThemeBox } from '@components/app/Settings';
import { TokenDropdown } from '@components/common';
import { useState } from 'react';

const SettingsView = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ThemeList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  grid-gap: 1rem;
  margin-top: 3rem;
`;

export const Settings = () => {
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(({ theme }) => theme.current);

  const changeTheme = (theme: Theme) => dispatch(ThemeActions.changeTheme({ theme }));

  const [dropdownSelected, setDropdownSelected] = useState({ label: '', value: '' });
  const onDropdownChange = (selected: any) => console.log(selected);
  const dropdownOptions = [
    { label: 'USDC', value: 'usdc' },
    { label: 'ETHEREUM', value: 'eth' },
    { label: 'KEEP3R', value: 'keep' },
    { label: 'Etc etcaaaaaaaaaaaaaaa', value: 'etc' },
  ];

  return (
    <SettingsView>
      Dropdown test:
      <TokenDropdown
        selected={dropdownSelected}
        setSelected={setDropdownSelected}
        onChange={onDropdownChange}
        options={dropdownOptions}
      />
      Theme:
      <ThemeList>
        {AVAILABLE_THEMES.map((theme: Theme, index) => (
          <ThemeBox
            themePallete={getTheme(theme)}
            name={theme}
            key={index}
            selected={theme === currentTheme}
            onClick={() => changeTheme(theme)}
          />
        ))}
      </ThemeList>
    </SettingsView>
  );
};
