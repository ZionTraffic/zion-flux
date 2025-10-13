import { BaseChart } from './BaseChart';
import { EChartsOption } from 'echarts';

interface BarChartProps {
  data: { day: string; value: number }[];
  title?: string;
  valueType?: 'currency' | 'number';
}

export const BarChart = ({ data, title = 'Valor Levado', valueType = 'currency' }: BarChartProps) => {
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
        const formattedValue = valueType === 'currency' 
          ? `R$ ${param.value.toLocaleString('pt-BR')}`
          : param.value.toLocaleString('pt-BR');
        return `${param.name}<br/>${formattedValue}`;
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
        show: false, // Esconder labels do eixo X pois agora estão dentro das barras
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
        formatter: (value: number) => {
          if (valueType === 'currency') {
            return `R$ ${value.toLocaleString('pt-BR')}`;
          }
          // For large numbers, use K, M notation
          if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
          }
          if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
          }
          return value.toLocaleString('pt-BR');
        },
      },
    },
    series: [
      {
        name: 'Valor',
        type: 'bar',
        data: data.map(d => d.value),
        label: {
          show: true,
          position: 'inside',
          formatter: (params: any) => {
            const dayLabel = data[params.dataIndex]?.day || '';
            return dayLabel;
          },
          color: '#ffffff',
          fontSize: 10,
          fontWeight: 600,
        },
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#00c6ff' },
              { offset: 1, color: '#0072ff' },
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
                { offset: 0, color: '#00d4ff' },
                { offset: 1, color: '#0080ff' },
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