interface CSATData {
  analista: string;
  csatMedio: number;
  totalAtendimentos: number;
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

  const getCSATColor = (csat: number) => {
    if (csat >= 4.5) return 'text-emerald-600 bg-emerald-500/10';
    if (csat >= 4.0) return 'text-blue-600 bg-blue-500/10';
    if (csat >= 3.5) return 'text-amber-600 bg-amber-500/10';
    return 'text-red-600 bg-red-500/10';
  };

  const getCSATIcon = (csat: number) => {
    if (csat >= 4.5) return (
      <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
    if (csat >= 4.0) return (
      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    if (csat >= 3.5) return (
      <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
    return (
      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

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
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Ranking
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Analista
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  CSAT Médio
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Atendimentos
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr 
                  key={item.analista}
                  className="border-b border-border/30 hover:bg-muted/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {index === 0 && <span className="text-xl font-bold text-amber-500">#1</span>}
                      {index === 1 && <span className="text-xl font-bold text-gray-400">#2</span>}
                      {index === 2 && <span className="text-xl font-bold text-amber-700">#3</span>}
                      {index > 2 && (
                        <span className="text-sm font-semibold text-muted-foreground w-8 text-center">
                          {index + 1}º
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-foreground">
                      {item.analista}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      {getCSATIcon(item.csatMedio)}
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCSATColor(item.csatMedio)}`}>
                        {item.csatMedio.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-sm font-semibold text-foreground">
                      {item.totalAtendimentos}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legenda */}
      <div className="mt-6 pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground mb-2 font-semibold">Legenda:</p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
            <span className="text-muted-foreground">Excelente (≥ 4.5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-muted-foreground">Bom (≥ 4.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
            <span className="text-muted-foreground">Regular (≥ 3.5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="text-muted-foreground">Precisa melhorar (&lt; 3.5)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
