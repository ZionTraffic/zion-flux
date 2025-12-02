import { cn } from "@/lib/utils";
import { useState } from "react";

interface EnhancedKpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "stable";
  };
  variant?: "blue" | "gray" | "red";
  delay?: number;
  tooltip?: {
    title: string;
    description: string;
    items?: { label: string; value: string | number }[];
  };
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
  red: {
    gradient: "#ef4444, #dc2626",
    iconBg: "bg-gradient-to-br from-red-500 to-red-600",
    shadow: "shadow-red-500/30",
  },
};

export function EnhancedKpiCard({
  label,
  value,
  icon,
  description,
  trend,
  variant = "blue",
  delay = 0,
  tooltip,
}: EnhancedKpiCardProps) {
  const styles = variantStyles[variant];
  const [showTooltip, setShowTooltip] = useState(false);

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
      onMouseEnter={() => tooltip && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
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
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">{label}</p>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground/70 mb-3 leading-relaxed">{description}</p>
        )}

        {/* Value */}
        <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>

        {/* Sparkline removido - era dado fictício/aleatório */}

      </div>

      {/* Tooltip */}
      {tooltip && showTooltip && (
        <div className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 p-4 rounded-xl bg-white border border-gray-200 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
          {/* Seta */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45" />
          
          <div className="relative">
            <h4 className="font-bold text-gray-800 mb-2">{tooltip.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{tooltip.description}</p>
            
            {tooltip.items && tooltip.items.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {tooltip.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-semibold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
