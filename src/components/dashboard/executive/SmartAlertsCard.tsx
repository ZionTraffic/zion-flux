import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, Lightbulb, ArrowRight } from "lucide-react";
import { Alert } from "@/hooks/useExecutiveDashboard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SmartAlertsCardProps {
  alerts: Alert[];
}

export const SmartAlertsCard = ({ alerts }: SmartAlertsCardProps) => {
  const navigate = useNavigate();

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'opportunity':
        return <Lightbulb className="h-5 w-5 text-emerald-400" />;
    }
  };

  const getAlertLabel = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return { 
          icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>,
          color: 'text-red-500',
          text: 'CRÍTICO' 
        };
      case 'warning':
        return { 
          icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>,
          color: 'text-amber-500',
          text: 'ATENÇÃO' 
        };
      case 'opportunity':
        return { 
          icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>,
          color: 'text-emerald-500',
          text: 'OPORTUNIDADE' 
        };
    }
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

  if (alerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass rounded-2xl p-8 border border-border/50 shadow-premium"
        style={{ background: 'var(--gradient-emerald)' }}
      >
        <div className="text-center">
          <span className="text-5xl mb-4 block">✨</span>
          <h3 className="text-xl font-bold text-emerald-400 mb-2">
            Tudo sob controle!
          </h3>
          <p className="text-sm text-muted-foreground">
            Nenhum alerta crítico detectado no momento.
          </p>
        </div>
      </motion.div>
    );
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
          <span className="text-3xl">⚠️</span>
          <div>
            <h3 className="text-xl font-bold text-foreground">
              Atenção: {alerts.length} {alerts.length === 1 ? 'item precisa' : 'itens precisam'} de ação
            </h3>
            <p className="text-sm text-muted-foreground">
              Recomendações baseadas em análise inteligente
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert, index) => {
          const label = getAlertLabel(alert.type);
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              className="glass rounded-xl p-4 border border-border/50 hover:border-border transition-colors"
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold flex items-center gap-1 ${label.color}`}>
                      {label.icon}
                      {label.text}
                    </span>
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
