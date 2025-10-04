import { motion } from "framer-motion";

interface OperationalKpiCardProps {
  icon: string;
  label: string;
  value: string;
  subtitle: string;
  gradient: string;
  delay?: number;
}

export function OperationalKpiCard({ icon, label, value, subtitle, gradient, delay = 0 }: OperationalKpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="glass rounded-2xl p-6 border border-border/50 hover:scale-105 transition-all duration-300"
      style={{ background: `linear-gradient(135deg, ${gradient})` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </motion.div>
  );
}
