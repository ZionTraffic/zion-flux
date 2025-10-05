import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface GlobalPerformanceChartProps {
  data: Array<{
    day: string;
    [key: string]: number | string;
  }>;
  workspaceNames: string[];
}

const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

export function GlobalPerformanceChart({ data, workspaceNames }: GlobalPerformanceChartProps) {
  return (
    <div className="glass rounded-2xl p-6 border border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-xl font-semibold">Performance Global - Últimos 30 Dias</h3>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <defs>
            {workspaceNames.map((name, index) => (
              <linearGradient key={name} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
              </linearGradient>
            ))}
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
          <Legend />
          {workspaceNames.map((name, index) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              fill={`url(#gradient${index})`}
              name={name}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
