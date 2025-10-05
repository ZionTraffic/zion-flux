import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import recommendationsData from "@/data/mock/recommendations.json";

interface AiAdvisorProps {
  workspaceId?: string;
}

const priorityColors = {
  high: "from-red-500/20 to-red-500/5 border-red-500/30",
  medium: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  low: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
};

const priorityBadgeColors = {
  high: "bg-red-500/10 text-red-400 border-red-500/30",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

export function AiAdvisor({ workspaceId }: AiAdvisorProps) {
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  const filteredRecommendations = workspaceId
    ? recommendationsData.filter(r => r.workspaceId === workspaceId)
    : recommendationsData;

  const currentRec = filteredRecommendations[displayedIndex];

  useEffect(() => {
    if (!currentRec) return;
    
    let currentIndex = 0;
    const fullText = currentRec.description;
    
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [currentRec]);

  if (filteredRecommendations.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 border border-border/50 text-center">
        <p className="text-muted-foreground">Nenhuma recomendação disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Recomendações Inteligentes</h2>
      
      {currentRec && (
        <motion.div
          key={displayedIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`glass rounded-2xl p-6 border bg-gradient-to-br ${priorityColors[currentRec.priority as keyof typeof priorityColors]}`}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 animate-pulse">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityBadgeColors[currentRec.priority as keyof typeof priorityBadgeColors]}`}>
                  {currentRec.priority === 'high' ? 'Alta Prioridade' : currentRec.priority === 'medium' ? 'Média Prioridade' : 'Baixa Prioridade'}
                </span>
                <span className="text-xs text-muted-foreground">{currentRec.workspaceName}</span>
              </div>
              <h3 className="text-xl font-bold mb-3">{currentRec.title}</h3>
              <p className="text-sm text-muted-foreground/80 leading-relaxed min-h-[60px] mb-4">
                {displayedText}
                <span className="inline-block w-1 h-4 ml-1 bg-purple-400 animate-pulse" />
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">{currentRec.impact}</span>
                </div>
                
                {currentRec.actionable && (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white"
                  >
                    Aplicar Ação
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex gap-2 justify-center">
            {filteredRecommendations.map((_, index) => (
              <button
                key={index}
                onClick={() => setDisplayedIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === displayedIndex 
                    ? "w-8 bg-purple-400" 
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
