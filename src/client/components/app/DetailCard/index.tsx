import { ReactNode } from 'react';
import styled from 'styled-components';

import { Card, CardHeader, CardContent, CardElement } from '@components/common';

const StyledCardElement = styled(CardElement)<{ stripes?: boolean }>`
  display: flex;
  justify-content: center;
  margin: 0;
  /* width: 100%; */
  height: 4.8rem;
  padding: 0 ${({ theme }) => theme.cardPadding};
  font-size: 1.4rem;

  > * {
    margin-top: 0;
    font-size: inherit;
  }

  ${({ stripes, theme }) =>
    stripes &&
    `
    &:nth-child(even) {
      background-color: ${theme.colors.surfaceVariantA};
    }
  `}
`;

const TitleCardElement = styled(CardElement)`
  display: flex;
  justify-content: center;
  margin: 0;
  padding: 0.6rem ${({ theme }) => theme.cardPadding};
`;

const StyledCardContent = styled(CardContent)`
  /* display: grid;
  align-items: center;
  grid-template-columns: 6rem 16.8rem 16.8rem 16.8rem 16.8rem 1fr; */

  // TODO Update theme to support change on button and font color and support this code
  /* &:hover > ${StyledCardElement} {
    background-color: ${({ theme }) => theme.colors.selectionBar};
  } */
`;

const StyledCardHeader = styled(CardHeader)`
  margin-bottom: 0.6rem;
`;

const StyledCard = styled(Card)`
  padding: ${({ theme }) => theme.cardPadding} 0;
  width: 100%;
`;

interface Metadata {
  key: string;
  header?: string;
  align?: 'flex-start' | 'center' | 'flex-end';
  fontWeight?: number;
  width?: string;
  grow?: '1' | '0';
  transform?: (data: Data) => ReactNode;
}

interface Data {
  [key: string]: string;
}

interface DetailCardProps {
  header: string;
  metadata: Metadata[];
  data: Data[];
  stripes?: boolean;
  SearchBar?: ReactNode;
}

export const DetailCard = ({ header, metadata, data, stripes, SearchBar }: DetailCardProps) => {
  if (data.length === 0 && !SearchBar) {
    return null;
  }

  return (
    <StyledCard>
      <StyledCardHeader header={header} />
      {SearchBar}

      <CardContent>
        {metadata.map(({ key, header, width, align, grow }) => (
          <TitleCardElement key={key} header={header} width={width} align={align} grow={grow} />
        ))}
      </CardContent>

      {data.map((item, i) => (
        <StyledCardContent key={`content-${i}`}>
          {metadata.map(({ key, width, align, grow, fontWeight, transform }) => (
            <StyledCardElement
              key={`element-${key}-${i}`}
              content={transform ? undefined : item[key]}
              fontWeight={fontWeight}
              width={width}
              align={align}
              grow={grow}
              stripes={stripes}
            >
              {transform && transform(item)}
            </StyledCardElement>
          ))}
        </StyledCardContent>
      ))}
    </StyledCard>
  );
};
