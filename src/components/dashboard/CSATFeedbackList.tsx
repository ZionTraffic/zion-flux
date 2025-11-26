import { useState } from 'react';
import { CSATFeedback } from '@/hooks/useCSATData';
import { MessageSquare, User, Calendar, Star, ChevronDown, ChevronUp, Bot, UserCircle } from 'lucide-react';

interface CSATFeedbackListProps {
  feedbacks: CSATFeedback[];
  maxVisible?: number;
}

// Cores por nota
const getNotaColor = (nota: number) => {
  if (nota >= 4) return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' };
  if (nota === 3) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' };
  return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
};

const getNotaLabel = (nota: number) => {
  const labels: Record<number, string> = {
    1: 'Muito Insatisfeito',
    2: 'Insatisfeito',
    3: 'Neutro',
    4: 'Satisfeito',
    5: 'Muito Satisfeito',
  };
  return labels[nota] || '';
};

export function CSATFeedbackList({ feedbacks, maxVisible = 5 }: CSATFeedbackListProps) {
  const [showAll, setShowAll] = useState(false);
  
  const visibleFeedbacks = showAll ? feedbacks : feedbacks.slice(0, maxVisible);
  const hasMore = feedbacks.length > maxVisible;

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Nenhuma justificativa registrada no período</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visibleFeedbacks.map((item, index) => {
        const colors = getNotaColor(item.nota);
        const dataFormatada = item.data 
          ? new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : '';

        return (
          <div 
            key={index}
            className={`p-4 rounded-xl border-2 ${colors.border} ${colors.bg} transition-all duration-300 hover:shadow-md`}
          >
            {/* Header com nota e data */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${colors.bg} ${colors.text} font-bold text-sm border ${colors.border}`}>
                  <Star className="w-4 h-4 fill-current" />
                  <span>{item.nota}</span>
                </div>
                <span className={`text-sm font-medium ${colors.text}`}>
                  {getNotaLabel(item.nota)}
                </span>
              </div>
              {dataFormatada && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{dataFormatada}</span>
                </div>
              )}
            </div>

            {/* Feedback/Justificativa */}
            <p className="text-gray-800 text-sm leading-relaxed mb-3">
              "{item.feedback}"
            </p>

            {/* Footer com analista, origem e cliente */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Analista: <strong className="text-foreground">{item.analista}</strong></span>
                </div>
                {item.origem && (
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.origem === 'ia' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.origem === 'ia' ? <Bot className="w-3 h-3" /> : <UserCircle className="w-3 h-3" />}
                    <span>{item.origem === 'ia' ? 'IA' : 'Humano'}</span>
                  </div>
                )}
              </div>
              {item.nome && (
                <span>Cliente: <strong className="text-foreground">{item.nome}</strong></span>
              )}
            </div>
          </div>
        );
      })}

      {/* Botão Ver mais/menos */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Ver mais {feedbacks.length - maxVisible} justificativas
            </>
          )}
        </button>
      )}
    </div>
  );
}
