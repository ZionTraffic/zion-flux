import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface MoneyKpiCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'emerald' | 'blue' | 'purple';
  delay?: number;
}

const variantGradients = {
  emerald: 'var(--gradient-emerald)',
  blue: 'var(--gradient-blue)',
  purple: 'var(--gradient-purple)',
};

interface MoneyKpiCardPropsExtended extends MoneyKpiCardProps {
  highlight?: boolean;
}

export const MoneyKpiCard = ({ 
  label, 
  value, 
  icon, 
  trend, 
  variant = 'blue',
  delay = 0,
  highlight = false
}: MoneyKpiCardPropsExtended) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`glass rounded-apple-lg p-6 border shadow-apple-lg card-hover ${
        highlight 
          ? 'border-[#ff1493] ring-2 ring-[#ff1493]/50 ring-offset-2 ring-offset-background' 
          : 'border-border/50'
      }`}
      style={{ 
        background: variantGradients[variant],
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl opacity-90">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            trend.isPositive 
              ? 'bg-accent/10 text-accent' 
              : 'bg-destructive/10 text-destructive'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground">
          {label}
        </h3>
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </p>
      </div>
    </motion.div>
  );
};
