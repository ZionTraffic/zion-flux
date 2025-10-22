import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface NovoLeadsChartProps {
  data: { day: string; value: number }[];
}

export default function NovoLeadsChart({ data }: NovoLeadsChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-6 border border-border/50 shadow-premium"
    >
      <h3 className="text-foreground text-lg font-bold mb-6 text-center">
        Novos Leads (Por Dia)
      </h3>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          {/* Gradiente azul vibrante 3D */}
          <defs>
            <linearGradient id="neonBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
              <stop offset="50%" stopColor="#2563eb" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8} />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.3"/>
            </filter>
          </defs>

          {/* Eixo X */}
          <XAxis
            dataKey="day"
            stroke="#64748b"
            fontSize={12}
            fontWeight={600}
            tickMargin={10}
            height={50}
            angle={-45}
            textAnchor="end"
          />

          {/* Eixo Y */}
          <YAxis 
            stroke="#64748b" 
            fontSize={12}
            fontWeight={600}
            tickMargin={5}
          />

          {/* Tooltip */}
          <Tooltip
            cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ color: "#1e293b", fontWeight: 600 }}
            itemStyle={{ color: "#3b82f6", fontWeight: 600 }}
          />

          {/* Barras com gradiente 3D */}
          <Bar
            dataKey="value"
            fill="url(#neonBlue)"
            radius={[8, 8, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
            filter="url(#shadow)"
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
