import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { PredictiveData } from "@/hooks/usePerformanceData";

interface PredictiveChartProps {
  data: PredictiveData[];
  workspaceName?: string;
}

export function PredictiveChart({ data, workspaceName }: PredictiveChartProps) {
  return (
    <div className="glass rounded-2xl p-6 border border-border/50">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Previsão de Performance</h3>
        <p className="text-sm text-muted-foreground">
          {workspaceName ? `Análise preditiva para ${workspaceName}` : 'Selecione uma workspace para ver previsões'}
        </p>
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
            />
            
            {/* Confidence interval */}
            <Area
              type="monotone"
              dataKey="confidenceMax"
              stroke="none"
              fill="url(#confidenceGradient)"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="confidenceMin"
              stroke="none"
              fill="url(#confidenceGradient)"
              fillOpacity={0.3}
            />
            
            {/* Actual data */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ r: 4, fill: "#3B82F6" }}
              name="Dados Reais"
            />
            
            {/* Predicted data */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#8B5CF6"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: "#8B5CF6" }}
              name="Previsão IA"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[350px] flex items-center justify-center text-muted-foreground">
          Selecione uma workspace para visualizar previsões
        </div>
      )}

      <div className="flex items-center gap-6 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span className="text-xs text-muted-foreground">Dados Reais</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500 opacity-50"></div>
          <span className="text-xs text-muted-foreground">Previsão IA</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500 opacity-20"></div>
          <span className="text-xs text-muted-foreground">Intervalo de Confiança</span>
        </div>
      </div>
    </div>
  );
}
