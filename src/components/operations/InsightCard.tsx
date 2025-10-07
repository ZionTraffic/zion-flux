import { motion } from "framer-motion";
import { LucideIcon, ArrowRight } from "lucide-react";

interface InsightCardProps {
  icon: LucideIcon;
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

const iconColors = {
  positive: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  alert: "bg-red-500/10 text-red-400 border-red-500/20",
  neutral: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const badgeColors = {
  positive: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
  alert: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
  neutral: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
};

export function InsightCard({ icon: Icon, title, description, action, type, delay = 0 }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`group glass rounded-apple-lg p-6 border bg-gradient-to-br ${typeColors[type]} shadow-apple-lg hover:shadow-apple-xl transition-apple-base`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-apple-md border ${iconColors[type]} transition-apple-base`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground/80 mb-4 leading-relaxed">{description}</p>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-apple-sm text-xs font-medium apple-press transition-apple-base ${badgeColors[type]}`}>
            <span>{action}</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
