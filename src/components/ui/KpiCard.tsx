import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient: string;
  delay: number;
}

export const KpiCard = ({ label, value, icon, trend, gradient, delay }: KpiCardProps) => {
  return (
    <div 
      className={`glass rounded-apple-lg p-6 border border-border/50 card-hover shadow-apple-lg animate-apple-slide-up`}
      style={{ 
        animationDelay: `${delay}s`,
        background: `linear-gradient(135deg, ${gradient})`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl opacity-80">
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
        <p className="text-3xl font-bold tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
};
