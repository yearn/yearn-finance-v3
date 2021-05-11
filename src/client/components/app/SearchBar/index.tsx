import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { get } from 'lodash';

import { Box, Input } from '@components/common';

const StyledInput = styled(Input)`
  width: 100%;
`;

interface SearchBarProps<T> {
  searchableData: Array<T>;
  searchableKeys: Array<keyof T | string>;
  onSearch: (data: Array<T>) => void;
}

export const SearchBar = <T,>({ searchableData, searchableKeys, onSearch }: SearchBarProps<T>) => {
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const filteredData = searchableData.filter((item) => {
      let matches = false;
      searchableKeys.forEach((key) => {
        const text = get(item, key);
        if (typeof text === 'string') {
          matches = text.toLowerCase().includes(searchText.toLowerCase());
          if (matches) return;
        }
      });

      return matches;
    });
    onSearch(filteredData);
  }, [searchText]);

  return (
    <Box width={1}>
      <StyledInput value={searchText} onChange={(e) => setSearchText(e.target.value)} />
    </Box>
  );
};
