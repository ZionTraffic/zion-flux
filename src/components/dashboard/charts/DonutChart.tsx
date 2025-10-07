import { BaseChart } from './BaseChart';
import { EChartsOption } from 'echarts';

interface DonutChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

export const DonutChart = ({ data, title = 'Distribuição' }: DonutChartProps) => {
  const colors = ['#00c6ff', '#10b981', '#fbbf24', '#ec4899', '#a855f7'];

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
      trigger: 'item',
      backgroundColor: 'rgba(10, 15, 31, 0.95)',
      borderColor: 'rgba(0, 198, 255, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#e5e7eb',
      },
      formatter: (params: any) => {
        return `${params.name}<br/>Valor: ${params.value}<br/>Percentual: ${params.percent}%`;
      },
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: {
        color: '#9ca3af',
        fontSize: 12,
      },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        name: 'Distribuição',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#0e162d',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#e5e7eb',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 198, 255, 0.5)',
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((item, index) => ({
          ...item,
          itemStyle: {
            color: colors[index % colors.length],
          },
        })),
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDuration: 1000,
      },
    ],
  };

  return <BaseChart option={option} height="350px" />;
};
