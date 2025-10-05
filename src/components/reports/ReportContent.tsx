import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Users,
  Clock,
  Brain,
  AlertTriangle,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ReportData } from "@/hooks/useReportData";
import { format } from "date-fns";

interface ReportContentProps {
  data: ReportData;
}

export function ReportContent({ data }: ReportContentProps) {
  const kpiCards = [
    {
      icon: Users,
      label: "Leads Recebidos",
      value: data.kpis.leadsRecebidos,
      colorScheme: "blue",
    },
    {
      icon: Target,
      label: "Leads Qualificados",
      value: data.kpis.leadsQualificados,
      colorScheme: "emerald",
    },
    {
      icon: Clock,
      label: "Em Follow-up",
      value: data.kpis.leadsFollowup,
      colorScheme: "amber",
    },
    {
      icon: DollarSign,
      label: "CPL Médio",
      value: `R$ ${data.kpis.cpl.toFixed(2)}`,
      colorScheme: "violet",
    },
  ];

  const colorSchemes = {
    blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20",
    emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20",
    amber: "from-amber-500/10 to-amber-600/5 border-amber-500/20",
    violet: "from-violet-500/10 to-violet-600/5 border-violet-500/20",
  };

  const iconSchemes = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  };

  return (
    <div className="space-y-8">
      {/* Report Header */}
      <div className="glass rounded-2xl p-8 border border-border/50 text-center">
        <h1 className="text-4xl font-bold mb-2">Relatório Estratégico</h1>
        <p className="text-xl text-muted-foreground">{data.workspace.name}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Período: {format(new Date(data.period.from), 'dd/MM/yyyy')} - {format(new Date(data.period.to), 'dd/MM/yyyy')}
        </p>
      </div>

      {/* Executive Summary */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Resumo Executivo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`glass rounded-2xl p-6 border bg-gradient-to-br ${colorSchemes[kpi.colorScheme as keyof typeof colorSchemes]} hover:shadow-xl hover:border-white/20 transition-all duration-300`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${iconSchemes[kpi.colorScheme as keyof typeof iconSchemes]}`}>
                  <kpi.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground/80 mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Chart */}
      <div className="glass rounded-2xl p-6 border border-border/50">
        <h3 className="text-xl font-semibold mb-6">Desempenho no Período</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.dailyData}>
            <defs>
              <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="investmentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
            <Legend />
            <Line
              type="monotone"
              dataKey="leads"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#leadsGradient)"
              name="Leads"
            />
            <Line
              type="monotone"
              dataKey="investment"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#investmentGradient)"
              name="Investimento (R$)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Metrics */}
      <div className="glass rounded-2xl p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Brain className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold">Eficiência da IA</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
            <p className="text-sm text-muted-foreground mb-1">Índice de Satisfação</p>
            <p className="text-2xl font-bold">{data.aiMetrics.satisfactionIndex.toFixed(0)}%</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
            <p className="text-sm text-muted-foreground mb-1">Tempo Médio</p>
            <p className="text-2xl font-bold">{Math.floor(data.aiMetrics.avgResponseTime / 60)}m {data.aiMetrics.avgResponseTime % 60}s</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
            <p className="text-sm text-muted-foreground mb-1">Treináveis</p>
            <p className="text-2xl font-bold">{data.aiMetrics.trainableCount}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
            <p className="text-sm text-muted-foreground mb-1">Críticas</p>
            <p className="text-2xl font-bold">{data.aiMetrics.criticalConversations}</p>
          </div>
        </div>
      </div>

      {/* Insights */}
      {data.insights.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold">Insights Detectados</h3>
          </div>
          <ul className="space-y-2">
            {data.insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-amber-400 mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Target className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold">Ações Recomendadas</h3>
          </div>
          <ul className="space-y-2">
            {data.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400 mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="glass rounded-2xl p-6 border border-border/50 text-center">
        <p className="text-sm text-muted-foreground">
          Zion App &copy; 2025 - Inteligência que impulsiona resultados
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Relatório gerado em {format(new Date(), 'dd/MM/yyyy HH:mm')}
        </p>
      </div>
    </div>
  );
}
