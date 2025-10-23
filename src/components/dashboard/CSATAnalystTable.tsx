interface CSATData {
  analista: string;
  csatMedio: number;
  totalAtendimentos: number;
  satisfeito?: number;
  poucoSatisfeito?: number;
  insatisfeito?: number;
}

interface CSATAnalystTableProps {
  data: CSATData[];
  isLoading?: boolean;
}

export function CSATAnalystTable({ data, isLoading = false }: CSATAnalystTableProps) {
  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
        <div className="animate-pulse">
          <div className="h-8 bg-muted/20 rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <h3 className="text-lg font-bold text-foreground">
          CSAT por Analista
        </h3>
        <span className="text-sm text-muted-foreground ml-2">
          ({mesAtual})
        </span>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum dado de CSAT disponível para este mês
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="space-y-4">
            {data.map((item, index) => {
              const total = item.totalAtendimentos;
              const satisfeito = item.satisfeito || 0;
              const poucoSatisfeito = item.poucoSatisfeito || 0;
              const insatisfeito = item.insatisfeito || 0;
              
              const percSatisfeito = total > 0 ? (satisfeito / total) * 100 : 0;
              const percPoucoSatisfeito = total > 0 ? (poucoSatisfeito / total) * 100 : 0;
              const percInsatisfeito = total > 0 ? (insatisfeito / total) * 100 : 0;

              return (
                <div key={item.analista} className="border border-border/30 rounded-lg p-4 hover:bg-muted/5 transition-colors">
                  {/* Header com nome e ranking */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {index === 0 && <span className="text-xl font-bold text-amber-500">#1</span>}
                      {index === 1 && <span className="text-xl font-bold text-gray-400">#2</span>}
                      {index === 2 && <span className="text-xl font-bold text-amber-700">#3</span>}
                      {index > 2 && (
                        <span className="text-sm font-semibold text-muted-foreground w-8 text-center">
                          {index + 1}º
                        </span>
                      )}
                      <span className="font-semibold text-foreground text-lg">
                        {item.analista}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {total} atendimentos
                    </span>
                  </div>

                  {/* Barra de progresso com 3 categorias */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 h-8 rounded-lg overflow-hidden bg-muted/20">
                      {/* Satisfeito - Verde */}
                      {percSatisfeito > 0 && (
                        <div 
                          className="h-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                          style={{ width: `${percSatisfeito}%` }}
                        >
                          {percSatisfeito >= 15 && `${satisfeito}`}
                        </div>
                      )}
                      
                      {/* Pouco Satisfeito - Azul */}
                      {percPoucoSatisfeito > 0 && (
                        <div 
                          className="h-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                          style={{ width: `${percPoucoSatisfeito}%` }}
                        >
                          {percPoucoSatisfeito >= 15 && `${poucoSatisfeito}`}
                        </div>
                      )}
                      
                      {/* Insatisfeito - Vermelho */}
                      {percInsatisfeito > 0 && (
                        <div 
                          className="h-full bg-red-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                          style={{ width: `${percInsatisfeito}%` }}
                        >
                          {percInsatisfeito >= 15 && `${insatisfeito}`}
                        </div>
                      )}
                    </div>

                    {/* Labels com valores */}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Satisfeito: {satisfeito} ({percSatisfeito.toFixed(0)}%)
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Pouco: {poucoSatisfeito} ({percPoucoSatisfeito.toFixed(0)}%)
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Insatisfeito: {insatisfeito} ({percInsatisfeito.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legenda */}
      <div className="mt-6 pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground mb-2 font-semibold">Legenda:</p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-muted-foreground">Satisfeito</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-muted-foreground">Pouco Satisfeito</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-muted-foreground">Insatisfeito</span>
          </div>
        </div>
      </div>
    </div>
  );
}
