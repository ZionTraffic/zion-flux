import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface GlobalKpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle: string;
  colorScheme: "blue" | "emerald" | "amber" | "violet" | "purple";
  delay?: number;
}

const colorSchemes = {
  blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20",
  emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20",
  amber: "from-amber-500/10 to-amber-600/5 border-amber-500/20",
  violet: "from-violet-500/10 to-violet-600/5 border-violet-500/20",
  purple: "from-purple-500/10 to-purple-600/5 border-purple-500/20",
};

const iconSchemes = {
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function GlobalKpiCard({ icon: Icon, label, value, subtitle, colorScheme, delay = 0 }: GlobalKpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass rounded-2xl p-6 border bg-gradient-to-br ${colorSchemes[colorScheme]} hover:shadow-xl hover:scale-105 hover:border-white/20 transition-all duration-300`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl border ${iconSchemes[colorScheme]} transition-all duration-300 group-hover:scale-110`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground/80 mb-1">{label}</p>
          <p className="text-3xl font-bold mb-1">{value}</p>
          <p className="text-xs text-muted-foreground/60">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}
