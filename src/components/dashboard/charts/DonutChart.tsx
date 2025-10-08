import { BaseChart } from './BaseChart';
import { EChartsOption } from 'echarts';

interface DonutChartProps {
  data: { name: string; value: number; color?: string }[];
  title?: string;
}

export const DonutChart = ({ data, title = 'Distribuição' }: DonutChartProps) => {
  const colorMap: { [key: string]: string } = {
    'Recebidos': '#00c6ff',      // Azul claro
    'Qualificando': '#10b981',   // Verde
    'Qualificados': '#a855f7',   // Roxo
    'Follow-up': '#fbbf24',      // Amarelo
    'Desqualificados': '#ef4444' // Vermelho
  };

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
        fontSize: 14,
      },
      formatter: (params: any) => {
        const value = params.value.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
        return `<strong>${params.name}</strong><br/>Investimento: ${value}<br/>Percentual: ${params.percent.toFixed(1)}%`;
      },
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        color: '#e5e7eb',
        fontSize: 14,
      },
      itemWidth: 14,
      itemHeight: 14,
      itemGap: 16,
    },
    series: [
      {
        name: 'Distribuição',
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#0e162d',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'inside',
          formatter: '{d}%',
          fontSize: 14,
          fontWeight: 'bold',
          color: '#ffffff',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#ffffff',
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
        data: data.map((item) => ({
          ...item,
          itemStyle: {
            color: item.color || colorMap[item.name] || '#9ca3af',
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
