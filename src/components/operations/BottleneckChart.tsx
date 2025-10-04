import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import gargalosData from "@/data/mock/gargalos.json";

export function BottleneckChart() {
  return (
    <div className="glass rounded-2xl p-6 border border-border/50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Análise de Gargalos</h2>
        <p className="text-sm text-muted-foreground">
          O principal gargalo atual é o tempo de resposta da IA. Reduzir em 30 segundos pode aumentar a conversão em 8%.
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={gargalosData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="label" 
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0,0,0,0.8)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#fff" }}
          />
          <Bar 
            dataKey="impacto" 
            fill="url(#colorGradient)" 
            radius={[8, 8, 0, 0]}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(251, 191, 36, 0.8)" />
              <stop offset="100%" stopColor="rgba(251, 191, 36, 0.3)" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {gargalosData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="text-muted-foreground">{item.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
