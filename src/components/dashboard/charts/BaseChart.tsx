import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

interface BaseChartProps {
  option: EChartsOption;
  height?: string;
  className?: string;
}

export const BaseChart = ({ option, height = '400px', className = '' }: BaseChartProps) => {
  const defaultOption: EChartsOption = {
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#e5e7eb',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '60px',
      containLabel: true,
    },
    ...option,
  };

  return (
    <ReactECharts
      option={defaultOption}
      style={{ height, width: '100%' }}
      className={className}
      opts={{ renderer: 'canvas' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
};
