import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, Award, ArrowRight } from "lucide-react";
import { Alert } from "@/hooks/useExecutiveDashboard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface StrategicInsightsCardProps {
  alerts: Alert[];
}

export const StrategicInsightsCard = ({ alerts }: StrategicInsightsCardProps) => {
  const navigate = useNavigate();

  // Filtrar apenas insights positivos (tipo 'opportunity')
  const positiveInsights = alerts.filter(alert => alert.type === 'opportunity');

  const getInsightIcon = () => {
    return <Lightbulb className="h-5 w-5 text-emerald-400" />;
  };

  const handleAction = (alert: Alert) => {
    if (alert.action === 'Otimizar Campanhas') {
      navigate('/trafego');
    } else if (alert.action === 'Qualificar Leads') {
      navigate('/qualificacao');
    } else if (alert.action === 'Analisar Conversas') {
      navigate('/analise');
    }
  };

  if (positiveInsights.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass rounded-2xl p-8 border border-border/50 shadow-premium"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💡</span>
          <div>
            <h3 className="text-xl font-bold text-foreground">
              Insights Estratégicos
            </h3>
            <p className="text-sm text-muted-foreground">
              Oportunidades identificadas para potencializar seus resultados
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {positiveInsights.map((alert, index) => {
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              className="glass rounded-xl p-4 border border-border/50 hover:border-emerald-400/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {getInsightIcon()}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-400">🟢 OPORTUNIDADE</span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {alert.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {alert.description}
                  </p>
                </div>
                {alert.action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => handleAction(alert)}
                  >
                    {alert.action}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
