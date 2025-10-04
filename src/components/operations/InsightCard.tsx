import { motion } from "framer-motion";

interface InsightCardProps {
  icon: string;
  title: string;
  description: string;
  action: string;
  type: "positive" | "warning" | "alert" | "neutral";
  delay?: number;
}

const typeColors = {
  positive: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
  warning: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  alert: "from-red-500/20 to-red-500/5 border-red-500/30",
  neutral: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
};

const badgeColors = {
  positive: "bg-emerald-500/20 text-emerald-400",
  warning: "bg-amber-500/20 text-amber-400",
  alert: "bg-red-500/20 text-red-400",
  neutral: "bg-blue-500/20 text-blue-400",
};

export function InsightCard({ icon, title, description, action, type, delay = 0 }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass rounded-2xl p-6 border bg-gradient-to-br ${typeColors[type]} hover:scale-[1.02] transition-all duration-300`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${badgeColors[type]}`}>
            <span>⚙️</span>
            <span>{action}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
