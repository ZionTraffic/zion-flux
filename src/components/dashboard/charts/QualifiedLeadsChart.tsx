import { BaseChart } from './BaseChart';
import { EChartsOption } from 'echarts';

interface QualifiedLeadsChartProps {
  data: Array<{ day: string; value: number }>;
  title?: string;
}

export const QualifiedLeadsChart = ({ data, title }: QualifiedLeadsChartProps) => {
  const option: EChartsOption = {
    title: {
      text: title || 'Leads Qualificados',
      left: 'center',
      textStyle: {
        color: '#e5e7eb',
        fontSize: 18,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderColor: '#10b981',
      borderWidth: 1,
      textStyle: {
        color: '#e5e7eb',
      },
      formatter: (params: any) => {
        const dataPoint = params[0];
        return `
          <div style="padding: 8px;">
            <div style="color: #10b981; font-weight: 600; margin-bottom: 4px;">${dataPoint.name}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 10px; height: 10px; background: #10b981; border-radius: 50%;"></span>
              <span style="font-weight: 600;">${dataPoint.value} leads qualificados</span>
            </div>
          </div>
        `;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '80px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.day),
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: '#374151',
          type: 'dashed',
        },
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
        formatter: (value: number) => {
          if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
          }
          if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
          }
          return value.toString();
        },
      },
    },
    series: [
      {
        name: 'Leads Qualificados',
        type: 'bar',
        data: data.map(item => item.value),
        barWidth: '70%',
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}',
          color: '#ffffff',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'Inter, system-ui, sans-serif',
          rotate: 90,
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
              {
                offset: 0,
                color: '#10b981',
              },
              {
                offset: 1,
                color: '#059669',
              },
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
                {
                  offset: 0,
                  color: '#34d399',
                },
                {
                  offset: 1,
                  color: '#10b981',
                },
              ],
            },
          },
        },
      },
    ],
  };

  return <BaseChart option={option} height="400px" />;
};
