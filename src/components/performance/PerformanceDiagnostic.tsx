import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { WorkspacePerformanceMetrics } from "@/hooks/usePerformanceData";

interface PerformanceDiagnosticProps {
  metrics: WorkspacePerformanceMetrics[];
}

const statusConfig = {
  excellent: {
    icon: CheckCircle,
    color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
    iconColor: "text-emerald-400",
    label: "Excelente",
  },
  good: {
    icon: CheckCircle,
    color: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
    iconColor: "text-blue-400",
    label: "Bom",
  },
  warning: {
    icon: AlertTriangle,
    color: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
    iconColor: "text-amber-400",
    label: "Atenção",
  },
  critical: {
    icon: AlertCircle,
    color: "from-red-500/20 to-red-500/5 border-red-500/30",
    iconColor: "text-red-400",
    label: "Crítico",
  },
};

export function PerformanceDiagnostic({ metrics }: PerformanceDiagnosticProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Diagnóstico de Performance</h2>
      {metrics.map((metric, index) => {
        const config = statusConfig[metric.status];
        const StatusIcon = config.icon;

        return (
          <motion.div
            key={metric.workspaceId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`glass rounded-2xl p-6 border bg-gradient-to-br ${config.color}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${config.color} border`}>
                  <StatusIcon className={`h-5 w-5 ${config.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{metric.workspaceName}</h3>
                  <p className={`text-sm ${config.iconColor}`}>{config.label}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-background/30 backdrop-blur">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">Conversão</p>
                  {getTrendIcon(metric.conversion.trend)}
                </div>
                <p className="text-xl font-bold">{metric.conversion.current.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {metric.conversion.change > 0 ? '+' : ''}{metric.conversion.change.toFixed(1)}%
                </p>
              </div>

              <div className="p-3 rounded-xl bg-background/30 backdrop-blur">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">CPL</p>
                  {getTrendIcon(metric.cpl.trend)}
                </div>
                <p className="text-xl font-bold">R$ {metric.cpl.current.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {metric.cpl.change > 0 ? '+' : ''}{metric.cpl.change.toFixed(1)}%
                </p>
              </div>

              <div className="p-3 rounded-xl bg-background/30 backdrop-blur">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">Velocidade IA</p>
                  {getTrendIcon(metric.aiSpeed.trend)}
                </div>
                <p className="text-xl font-bold">{Math.floor(metric.aiSpeed.current / 60)}m {Math.floor(metric.aiSpeed.current % 60)}s</p>
                <p className="text-xs text-muted-foreground">
                  {metric.aiSpeed.change > 0 ? '+' : ''}{metric.aiSpeed.change.toFixed(1)}%
                </p>
              </div>

              <div className="p-3 rounded-xl bg-background/30 backdrop-blur">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">Retenção</p>
                  {getTrendIcon(metric.retention.trend)}
                </div>
                <p className="text-xl font-bold">{metric.retention.current.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">
                  {metric.retention.change > 0 ? '+' : ''}{metric.retention.change.toFixed(1)}%
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
