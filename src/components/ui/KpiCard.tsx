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
      className="relative overflow-hidden rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card animate-apple-slide-up group"
      style={{ 
        animationDelay: `${delay}s`,
      }}
    >
      {/* Background gradient sutil */}
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ 
          background: `linear-gradient(135deg, ${gradient})`,
        }}
      />

      {/* Conteúdo */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div 
            className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${gradient})`,
              boxShadow: `0 4px 12px ${gradient.split(',')[0].replace(')', ', 0.3)')}`,
            }}
          >
            {icon}
          </div>
          {trend && trend.isPositive && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <TrendingUp className="h-3 w-3" />
              <span>+{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
          </h3>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </div>

      {/* Borda animada no hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ 
          background: `linear-gradient(135deg, ${gradient})`,
          WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px',
        }}
      />
    </div>
  );
};
