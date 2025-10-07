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
        const percentage = params.dataIndex > 0 
          ? ((params.value / data[0].value) * 100).toFixed(1)
          : '100.0';
        return `${params.name}<br/>Quantidade: ${params.value}<br/>Taxa: ${percentage}%`;
      },
    },
    series: [
      {
        name: 'Funil',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: Math.max(...data.map(d => d.value)),
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}: {c}',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid',
          },
        },
        itemStyle: {
          borderColor: '#0e162d',
          borderWidth: 2,
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
          label: {
            fontSize: 16,
            fontWeight: 700,
          },
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 198, 255, 0.5)',
          },
        },
        data: data,
        animationDuration: 1500,
        animationEasing: 'cubicOut',
      },
    ],
  };

  return (
    <div className="relative">
      <BaseChart option={option} height="400px" />
      
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
