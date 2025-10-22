import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { motion } from "framer-motion";

interface LeadsQualificadosChartProps {
  data: { day: string; value: number }[];
}

export default function LeadsQualificadosChart({ data }: LeadsQualificadosChartProps) {
  // Calcular total de leads qualificados
  const totalQualified = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-6 border border-border/50 shadow-premium"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-foreground text-lg font-bold">
          Leads Qualificados (Evolução)
        </h3>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-sm font-semibold text-muted-foreground">Total:</span>
          <span className="text-xl font-bold text-cyan-600">{totalQualified}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
          {/* Gradiente cyan vibrante 3D */}
          <defs>
            <linearGradient id="neonBlueQualified" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
              <stop offset="50%" stopColor="#0891b2" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#0e7490" stopOpacity={0.8} />
            </linearGradient>
            <filter id="shadowQualified">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.3"/>
            </filter>
          </defs>

          {/* Eixo X */}
          <XAxis
            dataKey="day"
            stroke="#94a3b8"
            fontSize={11}
            fontWeight={500}
            tickMargin={10}
            height={50}
            angle={-45}
            textAnchor="end"
          />

          {/* Eixo Y */}
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11}
            fontWeight={500}
            tickMargin={5}
            allowDecimals={false}
          />

          {/* Tooltip */}
          <Tooltip
            cursor={{ fill: "rgba(6, 182, 212, 0.1)" }}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ color: "#1e293b", fontWeight: 600 }}
            itemStyle={{ color: "#06b6d4", fontWeight: 600 }}
          />

          {/* Barras com gradiente 3D */}
          <Bar
            dataKey="value"
            fill="url(#neonBlueQualified)"
            radius={[8, 8, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
            filter="url(#shadowQualified)"
            maxBarSize={60}
          >
            <LabelList 
              dataKey="value" 
              position="top" 
              style={{ 
                fill: '#1e293b', 
                fontSize: '11px', 
                fontWeight: 700 
              }} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
