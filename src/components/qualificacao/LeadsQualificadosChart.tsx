import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface LeadsQualificadosChartProps {
  data: { day: string; value: number }[];
}

export default function LeadsQualificadosChart({ data }: LeadsQualificadosChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-4 rounded-2xl bg-[#0f1117] border border-[#1c1e24] shadow-md"
    >
      <h3 className="text-white text-lg font-semibold mb-4">
        Leads Qualificados (Evolução)
      </h3>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          {/* 🔹 Gradiente azul neon */}
          <defs>
            <linearGradient id="neonBlueQualified" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00CFFF" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#0066FF" stopOpacity={0.5} />
            </linearGradient>
          </defs>

          {/* 🔹 Eixo X (datas) */}
          <XAxis
            dataKey="day"
            stroke="#A0AEC0"
            fontSize={10}
            angle={-50}
            dy={20}
            tickMargin={10}
          />

          {/* 🔹 Eixo Y (quantidade) */}
          <YAxis stroke="#A0AEC0" fontSize={11} />

          {/* 🔹 Tooltip */}
          <Tooltip
            cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
            contentStyle={{
              backgroundColor: "#1a1b21",
              border: "1px solid #2d2e36",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#00CFFF" }}
          />

          {/* 🔹 Barras com gradiente e animação */}
          <Bar
            dataKey="value"
            fill="url(#neonBlueQualified)"
            radius={[6, 6, 0, 0]}
            animationDuration={900}
            animationEasing="ease-in-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
