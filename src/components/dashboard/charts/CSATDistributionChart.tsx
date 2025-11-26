import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CSATDistributionChartProps {
  distribuicao: {
    nota1: number;
    nota2: number;
    nota3: number;
    nota4: number;
    nota5: number;
  };
  totalAvaliacoes: number;
}

// Cores por nota: 1-2 vermelho, 3 amarelo, 4-5 verde
const NOTA_COLORS: Record<number, string> = {
  1: '#ef4444', // red-500
  2: '#f97316', // orange-500
  3: '#f59e0b', // amber-500
  4: '#34d399', // emerald-400
  5: '#10b981', // emerald-500
};

export function CSATDistributionChart({ distribuicao, totalAvaliacoes }: CSATDistributionChartProps) {
  const data = [
    { nota: '1', quantidade: distribuicao.nota1, label: 'Muito Insatisfeito', color: NOTA_COLORS[1] },
    { nota: '2', quantidade: distribuicao.nota2, label: 'Insatisfeito', color: NOTA_COLORS[2] },
    { nota: '3', quantidade: distribuicao.nota3, label: 'Neutro', color: NOTA_COLORS[3] },
    { nota: '4', quantidade: distribuicao.nota4, label: 'Satisfeito', color: NOTA_COLORS[4] },
    { nota: '5', quantidade: distribuicao.nota5, label: 'Muito Satisfeito', color: NOTA_COLORS[5] },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentual = totalAvaliacoes > 0 ? ((item.quantidade / totalAvaliacoes) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-200">
          <p className="font-bold text-gray-800">Nota {item.nota}</p>
          <p className="text-sm text-gray-600">{item.label}</p>
          <p className="text-lg font-bold" style={{ color: item.color }}>
            {item.quantidade} avaliações
          </p>
          <p className="text-sm text-gray-500">{percentual}% do total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="nota" 
            tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 600 }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={{ stroke: '#d1d5db' }}
            label={{ value: 'Nota', position: 'bottom', offset: 0, fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={{ stroke: '#d1d5db' }}
            label={{ value: 'Quantidade', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="quantidade" 
            radius={[8, 8, 0, 0]}
            maxBarSize={60}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
