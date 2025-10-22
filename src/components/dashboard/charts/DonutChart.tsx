import { BaseChart } from './BaseChart';
import { EChartsOption } from 'echarts';

interface DonutChartProps {
  data: { name: string; value: number; color?: string }[];
  title?: string;
}

export const DonutChart = ({ data, title = 'Distribuição' }: DonutChartProps) => {
  // Cores modernas e vibrantes para tema claro
  const colorMap: { [key: string]: string } = {
    'Recebidos': '#3b82f6',      // Azul vibrante
    'Qualificando': '#14b8a6',   // Teal
    'Qualificados': '#8b5cf6',   // Roxo vibrante
    'Follow-up': '#f59e0b',      // Laranja
    'Desqualificados': '#ef4444', // Vermelho
    'Topo de Funil': '#3b82f6',  // Azul
    'Meio de Funil': '#14b8a6',  // Teal
    'Fundo de Funil': '#8b5cf6', // Roxo
  };

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
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: {
        color: '#1e293b',
        fontSize: 13,
      },
      formatter: (params: any) => {
        const value = params.value.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
        return `<div style="padding: 4px;">
          <strong style="color: ${params.color};">${params.name}</strong><br/>
          <span style="color: #64748b;">Investimento:</span> <strong>${value}</strong><br/>
          <span style="color: #64748b;">Percentual:</span> <strong>${params.percent.toFixed(1)}%</strong>
        </div>`;
      },
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%',
      left: 'center',
      textStyle: {
        color: '#475569',
        fontSize: 13,
        fontWeight: 500,
      },
      itemWidth: 16,
      itemHeight: 16,
      itemGap: 24,
      icon: 'circle',
    },
    series: [
      {
        name: 'Distribuição',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '52%'],
        avoidLabelOverlap: true,
        // Efeito 3D
        itemStyle: {
          borderRadius: 12,
          borderColor: '#ffffff',
          borderWidth: 4,
          shadowBlur: 15,
          shadowColor: 'rgba(0, 0, 0, 0.15)',
          shadowOffsetY: 5,
          // Gradiente 3D
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 255, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 0, 0, 0.1)' }
            ],
            global: false
          }
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%',
          fontSize: 12,
          fontWeight: 'bold',
          color: '#1e293b',
          lineHeight: 18,
          textBorderColor: '#ffffff',
          textBorderWidth: 2,
          distanceToLabelLine: 5,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#1e293b',
          },
          itemStyle: {
            shadowBlur: 25,
            shadowOffsetY: 8,
            shadowColor: 'rgba(59, 130, 246, 0.5)',
          },
          scale: true,
          scaleSize: 12,
        },
        labelLine: {
          show: true,
          length: 20,
          length2: 15,
          smooth: true,
          lineStyle: {
            color: '#94a3b8',
            width: 2,
          },
        },
        data: data.map((item) => {
          const baseColor = item.color || colorMap[item.name] || '#94a3b8';
          return {
            ...item,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: baseColor },
                  { offset: 0.5, color: baseColor },
                  { offset: 1, color: `${baseColor}dd` } // Mais escuro no final
                ],
                global: false
              },
              shadowBlur: 15,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowOffsetY: 5,
            },
          };
        }),
        animationType: 'scale',
        animationEasing: 'cubicOut',
        animationDuration: 800,
      },
    ],
  };

  return <BaseChart option={option} height="400px" />;
};
