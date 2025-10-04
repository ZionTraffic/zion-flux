import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export function AiTrainerNarrative() {
  const [displayedText, setDisplayedText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  
  const fullText = `Análise de padrões de conversação detectou oportunidades significativas de otimização. O principal gargalo identificado é a solicitação prematura de dados sensíveis (CNPJ), causando 38% de taxa de abandono. 

A IA apresenta hesitação em respostas sobre valores e taxas, com tempo médio de 12 segundos por resposta - acima do ideal de 3 segundos. Isso impacta diretamente a percepção de confiança do cliente.

Recomendações prioritárias: (1) Postergar coleta de CNPJ para após qualificação inicial; (2) Simplificar vocabulário técnico, substituindo termos como 'CET' e 'TAC' por explicações diretas; (3) Implementar cache de respostas para perguntas frequentes sobre taxas.`;

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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
          <Brain className="h-6 w-6 text-violet-400 animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Diagnóstico Inteligente</h2>
          <p className="text-xs text-muted-foreground/60">Análise automática de padrões</p>
        </div>
      </div>
      
      <div className="relative">
        <p className="text-sm text-muted-foreground/80 leading-relaxed whitespace-pre-line">
          {displayedText}
          <span className="inline-block w-0.5 h-4 bg-violet-400 animate-pulse ml-0.5">|</span>
        </p>
        
        {!isExpanded && displayedText.length >= shortText.length && (
          <button
            onClick={() => setIsExpanded(true)}
            className="mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Ler análise completa →
          </button>
        )}
        
        {isExpanded && displayedText.length >= fullText.length && (
          <button
            onClick={() => setIsExpanded(false)}
            className="mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            ← Recolher
          </button>
        )}
      </div>
    </motion.div>
  );
}
