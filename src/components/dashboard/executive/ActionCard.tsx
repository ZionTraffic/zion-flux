import { motion } from "framer-motion";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ActionCardProps {
  title: string;
  icon: string;
  metrics: Array<{ label: string; value: string }>;
  alert?: string;
  linkTo: string;
  variant: 'trafego' | 'qualificacao' | 'analise';
  delay?: number;
}

const variantConfig = {
  trafego: {
    gradient: 'linear-gradient(135deg, #0d47a1 0%, #0a3c8a 100%)',
    color: 'text-blue-400',
  },
  qualificacao: {
    gradient: 'linear-gradient(135deg, #1b5e20 0%, #155d1e 100%)',
    color: 'text-emerald-400',
  },
  analise: {
    gradient: 'linear-gradient(135deg, #4a148c 0%, #3b1070 100%)',
    color: 'text-purple-400',
  },
};

export const ActionCard = ({ 
  title, 
  icon, 
  metrics, 
  alert, 
  linkTo, 
  variant,
  delay = 0 
}: ActionCardProps) => {
  const navigate = useNavigate();
  const config = variantConfig[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl p-6 border border-border/50 shadow-premium card-hover cursor-pointer"
      style={{ background: config.gradient }}
      onClick={() => navigate(linkTo)}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{icon}</span>
        {alert && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs">
            <AlertCircle className="h-3 w-3" />
            <span>{alert}</span>
          </div>
        )}
      </div>

      <h3 className={`text-xl font-bold mb-4 ${config.color}`}>
        {title}
      </h3>

      <div className="space-y-3 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{metric.label}</span>
            <span className="text-lg font-semibold text-foreground">{metric.value}</span>
          </div>
        ))}
      </div>

      <Button 
        variant="ghost" 
        className="w-full group"
        onClick={(e) => {
          e.stopPropagation();
          navigate(linkTo);
        }}
      >
        Ver Detalhes
        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </motion.div>
  );
};
