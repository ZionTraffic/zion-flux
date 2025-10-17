import { motion } from "framer-motion";
import { QualificationMetrics } from "@/hooks/useExecutiveDashboard";

interface PeriodSummaryCardProps {
  metrics: QualificationMetrics;
}

export const PeriodSummaryCard = ({ metrics }: PeriodSummaryCardProps) => {
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl p-8 border border-border/50 shadow-premium"
      style={{ background: 'var(--gradient-blue)' }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            📊 Resumo do Período
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Atualizado hoje, {currentTime}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">CPL (Custo por Lead)</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground">
              R$ {metrics.cpl.toFixed(2)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Média do período selecionado</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Total Investido</p>
          <p className="text-2xl font-bold text-foreground">
            R$ {metrics.invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-blue-400">
            Em todo o período selecionado
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Leads Qualificados</p>
          <p className="text-2xl font-bold text-foreground">
            {metrics.qualifiedLeads.toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-emerald-400">
            Gerados no período
          </p>
        </div>
      </div>
    </motion.div>
  );
};
