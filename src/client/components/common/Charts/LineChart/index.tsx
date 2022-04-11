import { FC } from 'react';
import styled from 'styled-components';
import { Serie, ResponsiveLine } from '@nivo/line';

import { useAppSelector, useWindowDimensions } from '@hooks';
import { getTheme } from '@themes';
import { formatAmount, formatUsd } from '@utils';
import { Text } from '@components/common';

export interface LineChartProps {
  className?: string;
  chartData: Serie[];
  tooltipLabel?: string;
  customSymbol?: string;
}

const StyledTooltip = styled.div<{ align: 'left' | 'right' }>`
  background: transparent;
  color: ${({ theme }) => theme.colors.icons.variant};
  background-color: ${({ theme }) => theme.colors.background};
  font-size: 1.4rem;
  position: relative;
  text-align: center;
  padding: ${({ theme }) => theme.layoutPadding};
  border-radius: ${({ theme }) => theme.globalRadius};

  ${({ align }) => align === 'left' && `left: 100%; transform: translateX(-45%)`};
  ${({ align }) => align === 'right' && `right: 100%; transform: translateX(45%)`};
`;

const LineBackground = styled.div`
  display: flex;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: ${({ theme }) => `
    repeating-linear-gradient(90deg, ${theme.colors.surfaceVariantA},
                                     ${theme.colors.surfaceVariantA} 12.2rem,
                                     ${theme.colors.background} 12.2rem,
                                     ${theme.colors.background} 24.4rem)
  `};

  // NOTE If you want to create variant bgs for each point with different widths use this:
  // div {
  //   flex: 1;
  //   &:nth-child(odd) {
  //     flex: 1;
  //     background: ${({ theme }) => theme.colors.surfaceVariantA};
  //   }
  // }
`;

const StyledLineChart = styled.div`
  width: 100%;
  height: 21rem;
  position: relative;
`;

const SymbolText = ({ point, customSymbol }: { point: any; customSymbol?: string }) =>
  customSymbol ? (
    <>
      {formatAmount(point.data.yFormatted.toString(), 2)} {customSymbol}
    </>
  ) : (
    <>{formatUsd(point.data.yFormatted.toString())}</>
  );

export const LineChart: FC<LineChartProps> = ({ chartData, tooltipLabel, customSymbol, className, ...props }) => {
  const { isTablet } = useWindowDimensions();
  const currentTheme = useAppSelector(({ theme }) => theme.current);
  const theme = getTheme(currentTheme);

  const lineTheme = {
    crosshair: {
      line: {
        stroke: theme.colors.primary,
        strokeWidth: 1,
        strokeOpacity: 0.35,
      },
    },
    textColor: theme.colors.icons.variant,
  };

  return (
    <StyledLineChart className={className} {...props}>
      <LineBackground />

      <ResponsiveLine
        data={chartData}
        theme={lineTheme}
        curve="linear"
        colors={theme.colors.icons.variant}
        margin={{ top: 20, right: 10, bottom: 36, left: 15 }}
        // xScale={{ type: 'point' }}
        xScale={{
          type: 'time',
          format: '%Y-%m-%d',
        }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false }}
        yFormat=" >-.2f"
        axisTop={null}
        axisRight={null}
        // axisBottom={null}
        axisBottom={{
          orient: 'bottom',
          tickSize: 0,
          tickPadding: 16,
          format: '%b %d',
          tickValues: isTablet ? 'every 8 days' : 'every 4 days',
        }}
        // xFormat="time:%Y-%m-%d"
        axisLeft={null}
        enableGridY={false}
        enableGridX={false}
        pointSize={14}
        pointBorderWidth={2}
        pointBorderColor={{ theme: 'background' }}
        pointLabelYOffset={-12}
        crosshairType="x"
        useMesh={true}
        legends={[]}
        lineWidth={3}
        // NOTE Custom tooltip to fix position
        tooltip={({ point }) => {
          const isFirstHalf = point.index < chartData[0].data.length / 2;

          return (
            <StyledTooltip align={isFirstHalf ? 'left' : 'right'}>
              <Text>{tooltipLabel || point.serieId}</Text>
              <Text>
                <SymbolText point={point} customSymbol={customSymbol} />
              </Text>
            </StyledTooltip>
          );
        }}
      />
    </StyledLineChart>
  );
};
