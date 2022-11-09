import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import { PositionItem } from '@src/core/types';
import { normalizeAmount } from '@src/utils';

import { Icon, ChevronLeftIcon } from './Icon';
import { SearchInput } from './SearchInput';

const ItemLabel = styled.div`
  flex: 1;
`;

const ListItem = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.globalRadius};
  padding: 0.8rem;
  text-transform: uppercase;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface};
  }

  ${(props) =>
    props.selected &&
    `
    background-color: ${props.theme.colors.surface};
  `}
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: 0.8rem;
  font-size: 1.4rem;
  padding: 0 0.8rem;
  overflow: hidden;
  overflow-y: auto;
`;

const StyledSearchInput = styled(SearchInput)`
  background-color: ${({ theme }) => theme.colors.surface};
`;

const BackButton = styled(Icon)`
  fill: inherit;
  height: 1.6rem;
  position: absolute;
  left: 0;
  padding: 1rem;
  margin-left: -1rem;
  box-sizing: content-box;
  cursor: pointer;
`;

const HeaderTitle = styled.div`
  color: ${({ theme }) => theme.colors.titles};
  font-size: 1.6rem;
  font-weight: 700;
  flex: 1;
  text-align: center;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const StyledSearchList = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
  color: ${({ theme }) => theme.colors.texts};
  fill: ${({ theme }) => theme.colors.texts};
  border-radius: ${({ theme }) => theme.globalRadius};
  padding: 1.6rem;
  gap: 1.6rem;
  max-height: 60rem;
  overflow: hidden;
  user-select: none;
  z-index: 1;
`;

// Token search list

export interface PositionSearchListProps {
  headerText?: string;
  // TODO Check how to remove the any[] and not throw error on searchInput
  list: any[] | PositionItem[];
  selected: PositionItem;
  setSelected: (selected: PositionItem) => void;
  onCloseList?: () => void;
}

export const PositionSearchList: FC<PositionSearchListProps> = ({
  headerText,
  list,
  selected,
  setSelected,
  onCloseList,
  ...props
}) => {
  const [filteredItems, setFilteredItems] = useState(list);

  useEffect(() => {
    setFilteredItems(list);
  }, [list]);

  const selectItem = (item: PositionItem) => {
    setSelected(item);
    if (onCloseList) {
      onCloseList();
    }
  };

  return (
    <StyledSearchList {...props}>
      <Header>
        {onCloseList && <BackButton Component={ChevronLeftIcon} onClick={onCloseList} />}
        <HeaderTitle>{headerText || 'Select an item'}</HeaderTitle>
      </Header>

      <StyledSearchInput
        searchableData={list}
        searchableKeys={['id', 'label']}
        placeholder="Search"
        onSearch={(data) => setFilteredItems(data)}
      />

      <List>
        {filteredItems.map(
          (item: PositionItem) =>
            item && (
              <ListItem key={item.id} onClick={() => selectItem(item)} selected={item.id === selected.id}>
                <ItemLabel>
                  Lender: {item.lender}
                  <br />
                  Deposit: {normalizeAmount(item.deposit, 18)}
                  <br />
                  Rates: {item.frate} / {item.drate}%
                </ItemLabel>
              </ListItem>
            )
        )}
      </List>
    </StyledSearchList>
  );
};
