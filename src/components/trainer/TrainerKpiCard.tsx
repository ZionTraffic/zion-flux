import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface TrainerKpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle: string;
  colorScheme: "emerald" | "blue" | "amber" | "violet" | "rose";
  delay?: number;
}

const colorSchemes = {
  emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40",
  blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40",
  amber: "from-amber-500/10 to-amber-600/5 border-amber-500/20 hover:border-amber-500/40",
  violet: "from-violet-500/10 to-violet-600/5 border-violet-500/20 hover:border-violet-500/40",
  rose: "from-rose-500/10 to-rose-600/5 border-rose-500/20 hover:border-rose-500/40",
};

const iconSchemes = {
  emerald: "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20",
  blue: "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20",
  amber: "bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20",
  violet: "bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20",
  rose: "bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20",
};

export function TrainerKpiCard({ icon: Icon, label, value, subtitle, colorScheme, delay = 0 }: TrainerKpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`group glass rounded-2xl p-6 border bg-gradient-to-br ${colorSchemes[colorScheme]} hover:shadow-xl transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconSchemes[colorScheme]} transition-all duration-300`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground/80">{label}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground/60">{subtitle}</p>
      </div>
    </motion.div>
  );
}
