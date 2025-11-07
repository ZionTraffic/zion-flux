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
      left: 'center',
      top: '2%',
      textStyle: {
        color: '#1e293b',
        fontSize: 18,
        fontWeight: 700,
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: {
        color: '#1e293b',
        fontSize: 13,
      },
      formatter: (params: any) => {
        const param = params[0];
        const formattedValue = valueType === 'currency' 
          ? `R$ ${param.value.toLocaleString('pt-BR')}`
          : param.value.toLocaleString('pt-BR');
        return `<div style="padding: 4px;">
          <strong>${param.name}</strong><br/>
          <span style="color: #64748b;">Valor:</span> <strong>${formattedValue}</strong>
        </div>`;
      },
    },
    grid: {
      top: '15%',
      bottom: '15%',
      left: '10%',
      right: '5%',
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.day),
      axisLine: {
        lineStyle: {
          color: '#e2e8f0',
          width: 2,
        },
      },
      axisLabel: {
        show: true,
        color: '#475569',
        fontSize: 11,
        fontWeight: 600,
        rotate: 45,
        interval: 'auto', // Mostra apenas labels que cabem sem sobrepor
        hideOverlap: true, // Esconde labels sobrepostas
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: '#e2e8f0',
          type: 'dashed',
        },
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: 600,
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
          position: 'top',
          formatter: (params: any) => {
            const formattedValue = valueType === 'currency' 
              ? `R$ ${params.value.toLocaleString('pt-BR')}`
              : params.value.toLocaleString('pt-BR');
            return formattedValue;
          },
          color: '#1e293b',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 0.5, color: '#2563eb' },
              { offset: 1, color: '#1d4ed8' },
            ],
          },
          shadowBlur: 10,
          shadowColor: 'rgba(59, 130, 246, 0.3)',
          shadowOffsetY: 4,
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
                { offset: 0, color: '#60a5fa' },
                { offset: 0.5, color: '#3b82f6' },
                { offset: 1, color: '#2563eb' },
              ],
            },
            shadowBlur: 15,
            shadowColor: 'rgba(59, 130, 246, 0.5)',
          },
        },
        barWidth: '50%',
        animationDuration: 800,
        animationEasing: 'cubicOut',
      },
    ],
  };

  return <BaseChart option={option} height="350px" />;
};