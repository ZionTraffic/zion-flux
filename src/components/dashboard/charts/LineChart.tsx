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
        return `<div style="padding: 4px;">
          <strong>${param.name}</strong><br/>
          <span style="color: #64748b;">Valor:</span> <strong>${param.value}</strong>
        </div>`;
      },
    },
    grid: {
      top: '15%',
      bottom: '12%',
      left: '8%',
      right: '5%',
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.day),
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#e2e8f0',
          width: 2,
        },
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: 600,
        rotate: 0,
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
      },
    },
    series: [
      {
        name: 'Valor',
        type: 'line',
        data: data.map(d => d.value),
        smooth: true,
        symbol: 'circle',
        symbolSize: 10,
        itemStyle: {
          color: '#3b82f6',
          borderWidth: 3,
          borderColor: '#ffffff',
          shadowBlur: 8,
          shadowColor: 'rgba(59, 130, 246, 0.3)',
        },
        lineStyle: {
          color: '#3b82f6',
          width: 4,
          shadowBlur: 8,
          shadowColor: 'rgba(59, 130, 246, 0.2)',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
              { offset: 0.5, color: 'rgba(59, 130, 246, 0.2)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ],
          },
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: '#60a5fa',
            borderWidth: 4,
            shadowBlur: 15,
            shadowColor: 'rgba(59, 130, 246, 0.6)',
          },
          scale: true,
        },
        animationDuration: 1000,
        animationEasing: 'cubicOut',
      },
    ],
  };

  return <BaseChart option={option} height="350px" />;
};
