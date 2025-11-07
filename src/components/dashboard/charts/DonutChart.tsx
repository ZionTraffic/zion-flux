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
    // Cores específicas para Sieg Financeiro
    'T1 - Sem Resposta': '#3b82f6',  // Azul
    'T2 - Respondido': '#14b8a6',    // Teal
    'T3 - Pago IA': '#8b5cf6',       // Roxo
    'T4 - Transferido': '#10b981',   // Verde
    'T5 - Desqualificado': '#ef4444', // Vermelho
  };

  const option: EChartsOption = {
    title: {
      text: title,
      left: '5%',
      top: '2%',
      textStyle: {
        color: '#1e293b',
        fontSize: 22,
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
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        color: '#1e293b',
        fontSize: 15,
        fontWeight: 600,
        lineHeight: 24,
      },
      itemWidth: 20,
      itemHeight: 20,
      itemGap: 20,
      icon: 'circle',
      formatter: (name: string) => {
        const item = data.find(d => d.name === name);
        if (!item) return name;
        const total = data.reduce((sum, d) => sum + d.value, 0);
        const percent = ((item.value / total) * 100).toFixed(1);
        
        // Detectar se é valor monetário (investimento) ou quantidade (leads)
        const isMonetary = name.includes('Funil') || title?.toLowerCase().includes('investimento');
        
        let valueFormatted: string;
        if (isMonetary) {
          // Formatar como moeda
          valueFormatted = item.value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        } else {
          // Formatar como número inteiro (leads)
          valueFormatted = `${Math.round(item.value)} leads`;
        }
        
        return `${name}\n${valueFormatted} (${percent}%)`;
      },
    },
    series: [
      {
        name: 'Distribuição',
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['35%', '50%'],
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
          show: false, // Desabilitar labels externos para evitar sobreposição
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
            color: '#1e293b',
          },
          itemStyle: {
            shadowBlur: 30,
            shadowOffsetY: 10,
            shadowColor: 'rgba(59, 130, 246, 0.6)',
          },
          scale: true,
          scaleSize: 15,
        },
        labelLine: {
          show: false, // Desabilitar linhas
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
