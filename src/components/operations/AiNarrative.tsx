import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function AiNarrative() {
  const [displayedText, setDisplayedText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  
  const fullText = `A operação da ASF Finance está em ritmo estável. O número de leads recebidos manteve-se constante nas últimas 72 horas, com uma média de 127 leads/dia. A eficiência da IA apresentou uma leve queda de 6% nas últimas 48h devido ao aumento do volume de interações simultâneas.

Pontos de atenção: O tempo médio de resposta aumentou para 2min 34s, acima do ideal de 1min 30s. Isso está correlacionado com um aumento de 12% no volume de conversas complexas que requerem múltiplas interações.

Recomendações: (1) Otimizar o fluxo de qualificação para reduzir tempo de processamento; (2) Implementar cache de respostas frequentes; (3) Revisar a agenda de follow-up para garantir contato em até 12h.`;

  const shortText = fullText.split('\n\n')[0];

  useEffect(() => {
    const textToShow = isExpanded ? fullText : shortText;
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex <= textToShow.length) {
        setDisplayedText(textToShow.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [isExpanded]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-6 border border-border/50"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">🧠</span>
        <h2 className="text-2xl font-bold">IA Narrativa</h2>
      </div>
      
      <div className="relative">
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {displayedText}
          <span className="animate-pulse">|</span>
        </p>
        
        {!isExpanded && displayedText.length >= shortText.length && (
          <button
            onClick={() => setIsExpanded(true)}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Ler mais →
          </button>
        )}
        
        {isExpanded && displayedText.length >= fullText.length && (
          <button
            onClick={() => setIsExpanded(false)}
            className="mt-4 text-sm text-primary hover:underline"
          >
            ← Recolher
          </button>
        )}
      </div>
    </motion.div>
  );
}
