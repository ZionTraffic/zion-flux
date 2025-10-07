import { BaseChart } from './BaseChart';
import { EChartsOption } from 'echarts';

interface LineChartProps {
  data: { day: string; value: number }[];
  title?: string;
}

export const LineChart = ({ data, title = 'Evolução Temporal' }: LineChartProps) => {
  const option: EChartsOption = {
    title: {
      text: title,
      left: 'left',
      textStyle: {
        color: '#e5e7eb',
        fontSize: 18,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 15, 31, 0.95)',
      borderColor: 'rgba(0, 198, 255, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#e5e7eb',
      },
      formatter: (params: any) => {
        const param = params[0];
        return `${param.name}<br/>Valor: ${param.value}`;
      },
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.day),
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: 'rgba(229, 231, 235, 0.1)',
        },
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(229, 231, 235, 0.05)',
        },
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
      },
    },
    series: [
      {
        name: 'Valor',
        type: 'line',
        data: data.map(d => d.value),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#00c6ff',
          borderWidth: 2,
          borderColor: '#fff',
        },
        lineStyle: {
          color: '#00c6ff',
          width: 3,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 198, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 198, 255, 0.05)' },
            ],
          },
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: '#00d4ff',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 198, 255, 0.5)',
          },
        },
        animationDuration: 1200,
        animationEasing: 'cubicOut',
      },
    ],
  };

  return <BaseChart option={option} height="350px" />;
};
