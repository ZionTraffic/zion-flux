import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, AlertTriangle, Zap, Target } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useAiInsights } from "@/hooks/useAiInsights";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, LucideIcon> = {
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
};

const typeColors = {
  performance: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
  alert: "from-red-500/20 to-red-500/5 border-red-500/30",
  opportunity: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  success: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
};

export function AiGlobalInsights() {
  const { insights, isLoading } = useAiInsights();
  const [displayedText, setDisplayedText] = useState("");
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const fullText = insights[currentInsightIndex]?.description || "";

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [fullText]);

  const currentInsight = insights[currentInsightIndex];
  const IconComponent = iconMap[currentInsight?.iconName as keyof typeof iconMap] || Brain;

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-6 border border-border/50">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass rounded-2xl p-6 border bg-gradient-to-br ${typeColors[currentInsight?.type as keyof typeof typeColors] || typeColors.success}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 animate-pulse">
          <Brain className="h-6 w-6 text-purple-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
              IA Global
            </span>
            <IconComponent className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">{currentInsight?.title}</h3>
          <p className="text-sm text-muted-foreground/80 leading-relaxed min-h-[60px]">
            {displayedText}
            <span className="inline-block w-1 h-4 ml-1 bg-purple-400 animate-pulse" />
          </p>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex gap-2 mt-4 justify-center">
        {insights.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentInsightIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentInsightIndex 
                ? "w-8 bg-purple-400" 
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
