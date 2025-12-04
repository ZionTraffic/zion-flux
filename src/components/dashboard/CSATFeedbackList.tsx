import { useState } from 'react';
import { CSATFeedback } from '@/hooks/useCSATData';
import { MessageSquare, User, Calendar, Star, ChevronDown, ChevronUp, Bot, UserCircle } from 'lucide-react';

interface CSATFeedbackListProps {
  feedbacks: CSATFeedback[];
  maxVisible?: number;
  searchTerm?: string;
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

export function CSATFeedbackList({ feedbacks, maxVisible = 5, searchTerm = '' }: CSATFeedbackListProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Usar apenas dados reais
  const allFeedbacks = feedbacks;
  
  // Filtrar por termo de busca se houver
  const filteredFeedbacks = searchTerm
    ? allFeedbacks.filter(item => 
        (item.nome && item.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.analista && item.analista.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : allFeedbacks;
  
  const visibleFeedbacks = showAll ? filteredFeedbacks : filteredFeedbacks.slice(0, maxVisible);
  const hasMore = filteredFeedbacks.length > maxVisible;

  if (filteredFeedbacks.length === 0) {
    if (searchTerm) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum feedback encontrado para "{searchTerm}"</p>
        </div>
      );
    }
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
            className="p-4 rounded-xl border-2 border-gray-200 bg-white transition-all duration-300 hover:shadow-md hover:border-purple-300"
          >
            {/* Header com agente e data */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {item.origem === 'ia' ? <Bot className="w-5 h-5 text-purple-600" /> : <User className="w-5 h-5 text-blue-600" />}
                <span className="font-bold text-base text-foreground">{item.analista}</span>
                {item.origem && (
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.origem === 'ia' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    <span>{item.origem === 'ia' ? 'IA' : 'Humano'}</span>
                  </div>
                )}
              </div>
              {dataFormatada && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{dataFormatada}</span>
                </div>
              )}
            </div>

            {/* Justificativa do Cliente */}
            {item.feedback && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-gray-800 text-sm leading-relaxed">
                  {item.feedback}
                </p>
              </div>
            )}

            {/* Nome do cliente ou telefone */}
            {(item.nome || item.telefone) && (
              <div className="mt-2 text-xs text-muted-foreground">
                Cliente: <strong className="text-foreground">
                  {item.nome || (item.telefone ? `Tel: ${item.telefone.replace(/^55/, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}` : 'Não identificado')}
                </strong>
              </div>
            )}
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
