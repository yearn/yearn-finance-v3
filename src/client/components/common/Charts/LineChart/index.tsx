import { FC } from 'react';
import styled from 'styled-components';
import { Serie, ResponsiveLine } from '@nivo/line';

import { Text } from '@components/common';

import { useAppSelector, useWindowDimensions } from '@hooks';
import { getTheme } from '@themes';
import { formatUsd } from '@utils';

export interface LineChartProps {
  className?: string;
  chartData: Serie[];
  tooltipLabel?: string;
}

const StyledTooltip = styled.div<{ align: 'left' | 'right' }>`
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 1.4rem;
  position: relative;
  text-align: center;

  ${({ align }) => align === 'left' && `left: 100%; transform: translateX(-50%)`};
  ${({ align }) => align === 'right' && `right: 100%; transform: translateX(50%)`};
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
                                     ${theme.colors.surfaceVariantA} 12rem,
                                     transparent 12rem,
                                     transparent 24rem)
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

export const LineChart: FC<LineChartProps> = ({ chartData, tooltipLabel, className, ...props }) => {
  const { isTablet } = useWindowDimensions();
  const currentTheme = useAppSelector(({ theme }) => theme.current);
  const theme = getTheme(currentTheme);

  // TODO Load currentTheme instead of defaultTheme
  const lineTheme = {
    crosshair: {
      line: {
        stroke: theme.colors.secondary,
        strokeWidth: 1,
        strokeOpacity: 0.35,
      },
    },
    textColor: theme.colors.onSurfaceSH1,
  };

  return (
    <StyledLineChart className={className} {...props}>
      <LineBackground />

      <ResponsiveLine
        data={chartData}
        theme={lineTheme}
        curve="monotoneX"
        colors={theme.colors.secondary}
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
              <Text>{formatUsd(point.data.yFormatted.toString())}</Text>
            </StyledTooltip>
          );
        }}
      />
    </StyledLineChart>
  );
};
