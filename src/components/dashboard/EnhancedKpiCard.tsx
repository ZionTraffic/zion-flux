import { cn } from "@/lib/utils";

interface EnhancedKpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "stable";
  };
  variant?: "blue" | "gray";
  delay?: number;
}

const variantStyles = {
  blue: {
    gradient: "#3b82f6, #2563eb",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/30",
  },
  gray: {
    gradient: "#6b7280, #4b5563",
    iconBg: "bg-gradient-to-br from-gray-500 to-gray-600",
    shadow: "shadow-gray-500/30",
  },
};

export function EnhancedKpiCard({
  label,
  value,
  icon,
  trend,
  variant = "blue",
  delay = 0,
}: EnhancedKpiCardProps) {
  const styles = variantStyles[variant];

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === "up") return <span className="text-green-500">↗</span>;
    if (trend.direction === "down") return <span className="text-red-500">↘</span>;
    return <span className="text-muted-foreground">→</span>;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.direction === "up") return "text-green-500";
    if (trend.direction === "down") return "text-red-500";
    return "text-muted-foreground";
  };

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
        {/* Icon and Trend */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className={cn("flex items-center justify-center w-12 h-12 rounded-xl text-2xl", styles.iconBg)}
            style={{
              boxShadow: `0 4px 12px ${styles.shadow.replace('shadow-', 'rgba(').replace('/30', ', 0.3)')}`,
            }}
          >
            <span>{icon}</span>
          </div>
          {trend && trend.direction === "up" && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span>↗</span>
              <span>+{trend.value}%</span>
            </div>
          )}
        </div>

        {/* Label */}
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">{label}</p>

        {/* Value */}
        <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>

        {/* Sparkline - only show for positive trends */}
        {trend && trend.direction === "up" && (
          <div className="mt-4 h-8 flex items-end gap-1">
            {[...Array(12)].map((_, i) => {
              const height = Math.random() * 100;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all duration-300 bg-emerald-500/30"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
