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
        {/* Label */}
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">{label}</p>

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
