import { FC, useState } from 'react';
import styled from 'styled-components';

import { ChevronDownIcon, Icon } from '../Icon';
import { Text } from '../Text';
import { SpinnerLoading } from '../SpinnerLoading';
import { Box, BoxProps } from '../Box';
import { Img } from '../Img';

const Container = styled(Box)<{ disabled?: boolean; tabIndex: number; selectable?: boolean; fullWidth?: boolean }>`
  position: relative;
  display: flex;
  height: 5.6rem;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'max-content')};
  min-width: 11rem;
  padding: 0;
  font-size: 1.6rem;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.titles};
  border-radius: ${({ theme }) => theme.globalRadius};
  cursor: ${({ selectable }) => (selectable ? 'pointer' : null)};
  user-select: none;

  ${(props) =>
    props.disabled &&
    `
    cursor: default;
    pointer-events: none;
  `}
`;

const StyledSpinnerLoading = styled(SpinnerLoading)`
  flex: 1;
  font-size: 1rem;
`;

const ArrowIcon = styled(Icon)<{ open?: boolean }>`
  height: 1rem;
  margin-left: 0.8rem;
  fill: ${({ theme }) => theme.colors.textsVariant};
  transition: transform 150ms ease-in-out;
  transform: rotate(${({ open }) => (open ? '180deg' : '0deg')});
`;

const StyledIcon = styled(Img)`
  flex-shrink: 0;
  width: 1.6rem;
  height: 1.6rem;
  margin-right: 0.8rem;
  fill: inherit;
`;

const StyledItemList = styled.div<{ open?: boolean; listPosition: 'top' | 'bottom' }>`
  position: absolute;
  display: none;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  max-height: 10rem;
  left: 0;
  padding: 0.8rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.globalRadius};
  overflow: hidden;
  overflow-y: auto;
  z-index: 1;

  ${(props) => props.open && `display: flex;`}
  ${(props) =>
    props.listPosition === 'top' &&
    `
    top: -0.8rem;
    transform: translateY(-100%);
  `}
  ${(props) =>
    props.listPosition === 'bottom' &&
    `
      bottom: -0.8rem;
      transform: translateY(100%);
  `}
`;

const StyledItem = styled.div<{ selected?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  white-space: nowrap;
  flex-shrink: 0;
  overflow: hidden;
  overflow-y: hidden;
  text-overflow: ellipsis;
  width: 100%;
  padding: 0.8rem;
  border-radius: ${({ theme }) => theme.globalRadius};
  transition: opacity 200ms ease-in-out;

  ${({ selected, theme }) =>
    selected &&
    `
      color: ${theme.colors.surface};
      background: ${theme.colors.titles};
  `}

  :hover {
    opacity: 0.8;
  }
`;

interface Item {
  key: string;
  value: string;
  icon?: string;
}

export interface DropdownProps extends BoxProps {
  selected: Item;
  items: Item[];
  onChange?: (selected: Item) => void;
  isLoading?: boolean;
  disabled?: boolean;
  hideIcons?: boolean;
  fullWidth?: boolean;
  listPosition?: 'top' | 'bottom';
  label?: string;
}

export const Dropdown: FC<DropdownProps> = ({
  selected,
  onChange,
  items,
  isLoading,
  disabled,
  hideIcons,
  fullWidth,
  listPosition = 'bottom',
  label,
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const isSingleItem = items.length === 1;

  let selectedText = '';
  if (selected?.key) {
    selectedText = selected.value;
  }

  const selectItem = (item: Item) => {
    if (disabled) return;
    if (onChange) onChange(item);
    setOpen(false);
  };

  return (
    <Box {...props}>
      {label && <Text mb="0.4rem">{label}</Text>}
      <Container tabIndex={0} disabled={disabled} selectable={!isSingleItem} onBlur={() => setOpen(false)} fullWidth>
        <StyledItem onClick={() => (!isSingleItem && !disabled ? setOpen(!open) : null)}>
          {!hideIcons && selected?.icon && <StyledIcon src={selected.icon} />}
          {!isLoading && (
            <Text flex={1} ellipsis>
              {selectedText}
            </Text>
          )}
          {isLoading && <StyledSpinnerLoading />}
          <ArrowIcon Component={ChevronDownIcon} open={open} visibility={isSingleItem ? 'hidden' : 'visible'} />
        </StyledItem>

        <StyledItemList open={open} listPosition={listPosition}>
          {items.map((item) => (
            <StyledItem key={item.key} onClick={() => selectItem(item)} selected={item.key === selected.key}>
              {!hideIcons && item?.icon && <StyledIcon src={item.icon} />}
              <Text flex={1} ellipsis>
                {item.value}
              </Text>
            </StyledItem>
          ))}
        </StyledItemList>
      </Container>
    </Box>
  );
};
