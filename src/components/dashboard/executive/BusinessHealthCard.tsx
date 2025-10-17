import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { BusinessHealth, QualificationMetrics } from "@/hooks/useExecutiveDashboard";

interface BusinessHealthCardProps {
  health: BusinessHealth;
  metrics: QualificationMetrics;
}

export const BusinessHealthCard = ({ health, metrics }: BusinessHealthCardProps) => {
  const getHealthConfig = () => {
    switch (health.status) {
      case 'healthy':
        return {
          emoji: '🟢',
          label: 'NEGÓCIO SAUDÁVEL',
          gradient: 'var(--gradient-emerald)',
          textColor: 'text-emerald-400',
        };
      case 'warning':
        return {
          emoji: '🟡',
          label: 'ATENÇÃO NECESSÁRIA',
          gradient: 'var(--gradient-amber)',
          textColor: 'text-amber-400',
        };
      case 'critical':
        return {
          emoji: '🔴',
          label: 'SITUAÇÃO CRÍTICA',
          gradient: 'linear-gradient(135deg, #3d1f2d 0%, #2a1621 100%)',
          textColor: 'text-rose-400',
        };
    }
  };

  const config = getHealthConfig();
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl p-8 border border-border/50 shadow-premium"
      style={{ background: config.gradient }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${config.textColor}`}>
            {config.label}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Hoje, {currentTime}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Score de Saúde</p>
          <p className="text-3xl font-bold">{health.score}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">CPL (Custo por Lead)</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground">
              R$ {metrics.cpl.toFixed(2)}
            </p>
            <div className={`flex items-center gap-1 text-sm ${
              metrics.cplTrend < 0 ? 'text-emerald-400' : 'text-destructive'
            }`}>
              <TrendingUp className={`h-4 w-4 ${metrics.cplTrend < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(metrics.cplTrend)}%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Meta: {'<'} R$ 50</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Investido</p>
          <p className="text-2xl font-bold text-foreground">
            R$ {metrics.invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-blue-400 text-xs">
            <TrendingUp className="h-3 w-3" />
            <span>{metrics.investedTrend}% vs período anterior</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Leads Qualificados</p>
          <p className="text-2xl font-bold text-foreground">
            {metrics.qualifiedLeads.toLocaleString('pt-BR')}
          </p>
          <div className="flex items-center gap-1 text-emerald-400 text-xs">
            <TrendingUp className="h-3 w-3" />
            <span>{metrics.qualifiedTrend}% vs período anterior</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
