import { motion } from "framer-motion";
import { FunnelStage } from "@/hooks/useExecutiveDashboard";

interface CompleteFunnelChartProps {
  data: FunnelStage[];
}

export const CompleteFunnelChart = ({ data }: CompleteFunnelChartProps) => {
  const maxValue = data[0]?.value || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass rounded-2xl p-8 border border-border/50 shadow-premium"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">
          Funil Completo de Conversão
        </h3>
        <p className="text-sm text-muted-foreground">
          Acompanhe cada etapa da jornada do cliente
        </p>
      </div>

      <div className="space-y-3">
        {data.map((stage, index) => {
          const widthPercent = (stage.value / maxValue) * 100;
          const isBottleneck = stage.isBottleneck;
          const isBelowBenchmark = stage.benchmark && stage.conversionRate 
            ? stage.conversionRate < stage.benchmark 
            : false;

          return (
            <motion.div
              key={stage.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {stage.name}
                  </span>
                  {isBottleneck && (
                    <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-medium">
                      GARGALO
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground">
                  {stage.value.toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="relative h-12 rounded-lg overflow-hidden bg-muted/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-lg"
                  style={{
                    background: isBottleneck || isBelowBenchmark
                      ? 'linear-gradient(to right, #ef4444, #dc2626)'
                      : 'linear-gradient(to right, #10b981, #059669)',
                    boxShadow: isBottleneck || isBelowBenchmark
                      ? '0 0 20px rgba(239, 68, 68, 0.3)'
                      : '0 0 20px rgba(16, 185, 129, 0.2)',
                  }}
                />
                
                {stage.conversionRate !== undefined && (
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <span className="text-sm font-medium text-foreground">
                      {stage.conversionRate.toFixed(1)}% converteram
                    </span>
                    {stage.benchmark && (
                      <span className={`text-xs ${
                        isBelowBenchmark ? 'text-destructive' : 'text-emerald-400'
                      }`}>
                        Benchmark: {stage.benchmark}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {index < data.length - 1 && (
                <div className="flex items-center justify-center py-1">
                  <div className="text-muted-foreground text-xl">↓</div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-border/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#10b981' }} />
            <span className="text-muted-foreground">Acima do benchmark</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
            <span className="text-muted-foreground">Abaixo do benchmark / Gargalo</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
