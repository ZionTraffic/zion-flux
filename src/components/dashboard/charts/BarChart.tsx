import { BaseChart } from './BaseChart';
import { EChartsOption } from 'echarts';

interface BarChartProps {
  data: { day: string; value: number }[];
  title?: string;
}

export const BarChart = ({ data, title = 'Valor Levado' }: BarChartProps) => {
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
        return `${param.name}<br/>R$ ${param.value.toLocaleString('pt-BR')}`;
      },
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.day),
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
        formatter: (value: number) => `R$ ${value.toLocaleString('pt-BR')}`,
      },
    },
    series: [
      {
        name: 'Valor',
        type: 'bar',
        data: data.map(d => d.value),
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#2D9BF0' },
              { offset: 1, color: '#1E7FD9' },
            ],
          },
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#3DAEF5' },
                { offset: 1, color: '#2890E0' },
              ],
            },
          },
        },
        barWidth: '60%',
        animationDuration: 1000,
        animationEasing: 'cubicOut',
      },
    ],
  };

  return <BaseChart option={option} height="350px" />;
};
