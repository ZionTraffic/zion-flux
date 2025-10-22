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
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
    color: 'text-blue-100',
    border: 'border-blue-500/20',
    shadow: '0 8px 24px 0 rgba(37, 99, 235, 0.2)',
  },
  qualificacao: {
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
    color: 'text-sky-100',
    border: 'border-sky-500/20',
    shadow: '0 8px 24px 0 rgba(3, 105, 161, 0.2)',
  },
  analise: {
    gradient: 'linear-gradient(135deg, #075985 0%, #0284c7 100%)',
    color: 'text-cyan-100',
    border: 'border-cyan-500/20',
    shadow: '0 8px 24px 0 rgba(2, 132, 199, 0.2)',
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
      className={`relative overflow-hidden rounded-2xl p-6 ${config.border} card-hover cursor-pointer`}
      style={{ 
        background: config.gradient,
        boxShadow: config.shadow,
      }}
      onClick={() => navigate(linkTo)}
    >
      {/* Liquid Glass Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.5) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2), transparent 70%)',
        animation: 'pulse 4s ease-in-out infinite'
      }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          {alert && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
              <AlertCircle className="h-3 w-3" />
              <span>{alert}</span>
            </div>
          )}
        </div>

        <h3 className={`text-xl font-bold mb-6 ${config.color} drop-shadow-lg`}>
          {title}
        </h3>

        <div className="space-y-3 mb-6">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-white/80">{metric.label}</span>
              <span className="text-lg font-semibold text-white drop-shadow-md">{metric.value}</span>
            </div>
          ))}
        </div>

        <Button 
          variant="ghost" 
          className="w-full group bg-white/10 hover:bg-white/20 text-white border-white/20"
          onClick={(e) => {
            e.stopPropagation();
            navigate(linkTo);
          }}
        >
          Ver Detalhes
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
};
