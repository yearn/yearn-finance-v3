import React, { FC } from 'react';
import styled from 'styled-components';

import { styledSystem, StyledSystemProps } from './styledSystem';

export interface TabsProps extends StyledSystemProps {
  value: number | string;
  onChange: (value: any) => void;
}

const StyledTabs = styled.div`
  --tabs-selected-bg: transparent;
  --tabs-selected-color: ${({ theme }) => theme.colors.titlesVariant};
  --tabs-color: ${({ theme }) => theme.colors.texts};

  display: flex;
  height: 8rem;
  font-size: 2rem;
  font-weight: 400;
  text-align: center;
  background: transparent;
  color: var(--tabs-color);
  overflow: hidden;
  user-select: none;

  ${styledSystem}
`;

export const Tabs: FC<TabsProps> = ({ value, onChange, children, ...props }) => {
  let childIndex = 0;

  const childrenElements = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return null;
    }

    const childValue = child.props.value ?? childIndex;
    const selected = childValue === value;

    childIndex += 1;
    return React.cloneElement(child, {
      selected,
      onChange,
      value: childValue,
    });
  });

  return <StyledTabs {...props}>{childrenElements}</StyledTabs>;
};

const StyledTab = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex: 1;
  font-size: inherit;
  font-weight: inherit;
  text-align: inherit;
  text-transform: inherit;
  border-radius: inherit;
  border-bottom: 2px solid var(--tabs-color);
  background: inherit;
  cursor: pointer;

  ${({ selected }) =>
    selected &&
    `
    background: var(--tabs-selected-bg);
    color: var(--tabs-selected-color);
    border-color: var(--tabs-selected-color);
    font-weight: 700;
    cursor: default;
  `};

  ${styledSystem}
`;

export interface TabProps extends StyledSystemProps {
  value?: number | string;
  selected?: boolean;
  disabled?: boolean;
  onChange?: (value: any) => void;
}

export const Tab: FC<TabProps> = ({ value, selected, onChange, children, ...props }) => {
  const handleClick = () => {
    if (!selected && onChange) {
      onChange(value);
    }
  };

  return (
    <StyledTab key={value} selected={selected} onClick={handleClick} {...props}>
      {children}
    </StyledTab>
  );
};

export interface TabPanelProps extends StyledSystemProps {
  value: number | string;
  tabValue: number | string;
}

const StyledTabPanel = styled.div<{ hidden?: boolean }>`
  ${styledSystem}
`;

export const TabPanel: FC<TabPanelProps> = ({ value, tabValue, children, ...props }) => (
  <StyledTabPanel hidden={value !== tabValue} {...props}>
    {children}
  </StyledTabPanel>
);
