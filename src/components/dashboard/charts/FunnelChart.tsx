import { BaseChart } from './BaseChart';
import { EChartsOption } from 'echarts';
import { useEffect, useState } from 'react';

interface FunnelChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

export const FunnelChart = ({ data, title = 'Funil de Conversão' }: FunnelChartProps) => {
  const [coins, setCoins] = useState<{ id: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate coin animation delays
    const coinArray = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      delay: i * 0.4,
    }));
    setCoins(coinArray);
  }, []);

  // Calculate conversion rate (last stage / first stage)
  const conversionRate = data.length >= 3 && data[0].value > 0
    ? ((data[2].value / data[0].value) * 100).toFixed(2)
    : '0.00';

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
      borderColor: 'rgba(139, 92, 246, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#e5e7eb',
      },
      formatter: (params: any) => {
        const percentage = params.dataIndex > 0 
          ? ((params.value / data[0].value) * 100).toFixed(1)
          : '100.0';
        return `${params.name}<br/>Quantidade: ${params.value.toLocaleString('pt-BR')}<br/>Taxa: ${percentage}%`;
      },
    },
    series: [
      {
        name: 'Funil',
        type: 'funnel',
        left: '5%',
        top: 80,
        bottom: 60,
        width: '65%',
        min: 0,
        max: Math.max(...data.map(d => d.value)),
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 1,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}\n{c}',
          color: '#fff',
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 24,
        },
        labelLine: {
          show: false,
        },
        itemStyle: {
          borderColor: '#1a1f3a',
          borderWidth: 3,
          borderRadius: 8,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#4A3F8C' },
              { offset: 0.5, color: '#5B7FCE' },
              { offset: 1, color: '#6B8FDE' },
            ],
          },
          shadowBlur: 20,
          shadowColor: 'rgba(91, 127, 206, 0.5)',
          shadowOffsetY: 8,
        },
        emphasis: {
          label: {
            fontSize: 18,
            fontWeight: 800,
          },
          itemStyle: {
            shadowBlur: 30,
            shadowColor: 'rgba(139, 92, 246, 0.7)',
          },
        },
        data: data,
        animationDuration: 1500,
        animationEasing: 'cubicOut',
      },
    ],
  };

  return (
    <div className="relative animate-fade-in-up">
      <BaseChart option={option} height="450px" />
      
      {/* Taxa de Conversão - Destacada à Direita */}
      <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-center animate-scale-in" style={{ animationDelay: '500ms' }}>
        <div className="text-5xl md:text-7xl font-bold bg-gradient-to-br from-[#FFD700] via-[#FFC107] to-[#FFA500] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">
          {conversionRate}%
        </div>
        <div className="text-xs md:text-sm text-muted-foreground/70 mt-2 font-medium">
          Taxa de Conversão
        </div>
      </div>
      
      {/* Animated Gold Coins */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 overflow-hidden pointer-events-none">
        {coins.map((coin) => (
          <div
            key={coin.id}
            className="absolute left-1/2 -translate-x-1/2 animate-coin-fall"
            style={{
              animationDelay: `${coin.delay}s`,
              left: `${45 + (coin.id % 3) * 5}%`,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="url(#goldGradient)" stroke="#FFD700" strokeWidth="1.5"/>
              <text x="12" y="16" textAnchor="middle" fill="#0e162d" fontSize="12" fontWeight="bold">R$</text>
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};
