import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumKpiCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'blue' | 'gray';
  delay?: number;
}

const variantStyles = {
  blue: {
    gradient: '#3b82f6, #2563eb',
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/30",
  },
  gray: {
    gradient: '#6b7280, #4b5563',
    iconBg: "bg-gradient-to-br from-gray-500 to-gray-600",
    shadow: "shadow-gray-500/30",
  },
};

export const PremiumKpiCard = ({ 
  label, 
  value, 
  icon, 
  trend, 
  variant = 'blue',
  delay = 0 
}: PremiumKpiCardProps) => {
  // Validação de segurança: garante que variant seja válido
  const safeVariant = (variant === 'blue' || variant === 'gray') ? variant : 'blue';
  const styles = variantStyles[safeVariant];
  
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6",
        "bg-card border border-border/50",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-300",
        "hover:scale-105",
        "cursor-pointer"
      )}
      style={{
        animationDelay: `${delay}s`,
        animation: "fadeInUp 0.6s ease-out forwards",
      }}
    >
      {/* Background gradient sutil */}
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ 
          background: `linear-gradient(135deg, ${styles.gradient})`,
        }}
      />

      <div className="relative z-10">
        {/* Label and Value */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
          </h3>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};
