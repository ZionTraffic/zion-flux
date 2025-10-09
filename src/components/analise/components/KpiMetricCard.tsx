import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface KpiMetricCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  gradient: string;
  delay?: number;
}

export const KpiMetricCard = ({ icon, label, value, gradient, delay = 0 }: KpiMetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className={`p-6 glass border border-border/50 ${gradient}`}>
        <div className="flex items-start gap-4">
          <div className="text-3xl opacity-80">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
