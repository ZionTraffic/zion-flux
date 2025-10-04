import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface SentimentChartProps {
  data: { day: string; sentiment: number; volume: number }[];
}

export function SentimentChart({ data }: SentimentChartProps) {
  return (
    <div className="glass rounded-2xl p-6 border border-border/50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Correlação Temporal</h2>
        <p className="text-sm text-muted-foreground">
          Evolução do sentimento médio e volume de conversas nos últimos dias
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="day" 
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
            domain={[0, 1]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0,0,0,0.8)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#fff" }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="sentiment" 
            stroke="#AF52DE" 
            strokeWidth={2}
            name="Sentimento Médio"
            dot={{ fill: "#AF52DE", r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="volume" 
            stroke="#007AFF" 
            strokeWidth={2}
            name="Volume"
            dot={{ fill: "#007AFF", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
