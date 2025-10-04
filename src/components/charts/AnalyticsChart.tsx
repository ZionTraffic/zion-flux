import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { DailyData } from '@/hooks/useAsfAnalytics';

interface AnalyticsChartProps {
  data: DailyData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-heavy rounded-xl p-4 border border-border/50 shadow-lg">
        <p className="text-sm font-medium mb-2">{payload[0].payload.date}</p>
        <div className="space-y-1">
          <p className="text-xs text-primary">
            Leads: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-xs text-secondary">
            Investimento: <span className="font-bold">R$ {payload[1]?.value?.toFixed(2)}</span>
          </p>
          <p className="text-xs text-accent">
            CPL: <span className="font-bold">R$ {payload[2]?.value?.toFixed(2)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const AnalyticsChart = ({ data }: AnalyticsChartProps) => {
  return (
    <div className="glass rounded-2xl p-6 border border-border/50 animate-slide-up" style={{ animationDelay: '0.35s' }}>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Performance Diária</h2>
        <p className="text-sm text-muted-foreground">Evolução dos principais indicadores</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCpl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="leads" 
            stroke="hsl(217, 91%, 60%)" 
            strokeWidth={2}
            fill="url(#colorLeads)" 
          />
          <Area 
            type="monotone" 
            dataKey="investment" 
            stroke="hsl(262, 83%, 58%)" 
            strokeWidth={2}
            fill="url(#colorInvestment)" 
            yAxisId={1}
          />
          <Area 
            type="monotone" 
            dataKey="cpl" 
            stroke="hsl(142, 71%, 45%)" 
            strokeWidth={2}
            fill="url(#colorCpl)" 
            yAxisId={2}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-6 mt-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Leads</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-muted-foreground">Investimento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-muted-foreground">CPL</span>
        </div>
      </div>
    </div>
  );
};
