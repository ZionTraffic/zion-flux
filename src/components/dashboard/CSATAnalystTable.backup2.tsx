import { useState } from 'react';

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
  dateRange?: { from?: Date; to?: Date };
}

export function CSATAnalystTable({ data, isLoading = false, dateRange }: CSATAnalystTableProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  // Formatar período baseado no filtro de data
  const getPeriodoLabel = () => {
    if (!dateRange?.from && !dateRange?.to) {
      return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
    
    if (dateRange.from && dateRange.to) {
      const fromStr = dateRange.from.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const toStr = dateRange.to.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return `${fromStr} - ${toStr}`;
    }
    
    if (dateRange.from) {
      return `desde ${dateRange.from.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    }
    
    return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };
  
  const mesAtual = getPeriodoLabel();

  const humanAnalysts = data.filter((item) => item.analista.toLowerCase() !== 'ia');
  const iaAnalyst = data.find((item) => item.analista.toLowerCase() === 'ia');

  const totalRespostas = data.reduce((total, item) => total + (item.totalAtendimentos || 0), 0);
  const totalSatisfeito = data.reduce((total, item) => total + (item.satisfeito || 0), 0);
  const totalPouco = data.reduce((total, item) => total + (item.poucoSatisfeito || 0), 0);
  const totalInsatisfeito = data.reduce((total, item) => total + (item.insatisfeito || 0), 0);
  const satisfacaoGeral = totalRespostas > 0 ? (totalSatisfeito / totalRespostas) * 100 : 0;

  const sectionsEmpty = humanAnalysts.length === 0 && !iaAnalyst;

  const getRankBadge = (position: number) => {
    if (position === 1) {
      return <span className="text-xl font-bold text-amber-500">#1</span>;
    }
    if (position === 2) {
      return <span className="text-xl font-bold text-gray-400">#2</span>;
    }
    if (position === 3) {
      return <span className="text-xl font-bold text-amber-700">#3</span>;
    }

    return (
      <span className="text-sm font-semibold text-muted-foreground w-8 text-center">
        {position}º
      </span>
    );
  };

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
    <div className="relative overflow-hidden rounded-3xl p-8 border border-white/20 shadow-2xl" style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 0 rgba(255,255,255,0.2)'
    }}>
      {/* Liquid Glass Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/30 blur-xl rounded-full animate-pulse" />
            <svg className="relative w-8 h-8 text-amber-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
              CSAT por Analista
            </h3>
            <p className="text-sm text-muted-foreground/80">{mesAtual}</p>
          </div>
        </div>

      {sectionsEmpty ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum dado de CSAT disponível para este mês
          </p>
        </div>
      ) : (
        <>
          {/* Premium Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="group relative overflow-hidden rounded-2xl p-6 border border-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer" style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.05) 100%)',
              backdropFilter: 'blur(10px)',
              transform: 'translateZ(0)'
            }}>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                    <span className="text-2xl font-bold text-white">{totalRespostas}</span>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1">Total de Avaliações</p>
                <p className="text-sm font-medium text-foreground">Últimos 90 dias</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl p-6 border border-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer" style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)',
              backdropFilter: 'blur(10px)',
              transform: 'translateZ(0)'
            }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                    <span className="text-2xl font-bold text-white">{Math.round(satisfacaoGeral)}%</span>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1">Satisfação Geral</p>
                <p className="text-sm font-medium text-foreground">{totalSatisfeito} positivas</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl p-6 border border-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer" style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.05) 100%)',
              backdropFilter: 'blur(10px)',
              transform: 'translateZ(0)'
            }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-emerald-500">{totalSatisfeito}</span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-500">{totalPouco}</span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-red-500">{totalInsatisfeito}</span>
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1">Distribuição</p>
                <p className="text-sm font-medium text-foreground">Por categoria</p>
              </div>
            </div>
          </div>

          {humanAnalysts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <h4 className="text-base font-semibold text-foreground">Atendimento humano</h4>
                  <p className="text-sm text-muted-foreground">Ranking dos analistas e desempenho por categoria</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {humanAnalysts.map((item, index) => {
                  const total = item.totalAtendimentos;
                  const satisfeito = item.satisfeito || 0;
                  const poucoSatisfeito = item.poucoSatisfeito || 0;
                  const insatisfeito = item.insatisfeito || 0;
              
              const percSatisfeito = total > 0 ? (satisfeito / total) * 100 : 0;
              const percPoucoSatisfeito = total > 0 ? (poucoSatisfeito / total) * 100 : 0;
              const percInsatisfeito = total > 0 ? (insatisfeito / total) * 100 : 0;
                  return (
                    <div
                      key={item.analista}
                      onMouseEnter={() => setHoveredCard(item.analista)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className="group relative overflow-hidden rounded-2xl p-6 border border-white/10 transition-all duration-500 cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                        backdropFilter: 'blur(12px)',
                        transform: hoveredCard === item.analista ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                        boxShadow: hoveredCard === item.analista 
                          ? '0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(59,130,246,0.2)'
                          : '0 4px 20px rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* 3D Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getRankBadge(index + 1)}
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Analista</p>
                            <p className="text-lg font-semibold text-foreground">{item.analista}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Atendimentos</p>
                          <p className="text-sm font-semibold text-foreground">{total.toLocaleString('pt-BR')}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-2 h-8 rounded-lg overflow-hidden bg-muted/20 flex-1">
                          {percSatisfeito > 0 && (
                            <div
                              className="h-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                              style={{ width: `${percSatisfeito}%` }}
                            >
                              {percSatisfeito >= 20 && `${satisfeito}`}
                            </div>
                          )}
                          {percPoucoSatisfeito > 0 && (
                            <div
                              className="h-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                              style={{ width: `${percPoucoSatisfeito}%` }}
                            >
                              {percPoucoSatisfeito >= 20 && `${poucoSatisfeito}`}
                            </div>
                          )}
                          {percInsatisfeito > 0 && (
                            <div
                              className="h-full bg-red-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                              style={{ width: `${percInsatisfeito}%` }}
                            >
                              {percInsatisfeito >= 20 && `${insatisfeito}`}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end text-xs text-muted-foreground">
                          <span>CSAT médio</span>
                          <span className="text-sm font-semibold text-foreground">
                            {item.csatMedio.toFixed(1)} / 5
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Satisfeito: {satisfeito} ({percSatisfeito.toFixed(0)}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Pouco: {poucoSatisfeito} ({percPoucoSatisfeito.toFixed(0)}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Insatisfeito: {insatisfeito} ({percInsatisfeito.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {iaAnalyst && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-semibold text-foreground">Assistente IA</h4>
                  <p className="text-sm text-muted-foreground">Feedbacks recebidos diretamente pela automação</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {iaAnalyst.totalAtendimentos.toLocaleString('pt-BR')} avaliações
                </div>
              </div>

              <div className="glass border border-dashed border-blue-500/40 bg-blue-500/5 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <p className="text-lg font-semibold text-foreground">IA</p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      A IA participa do atendimento inicial e coleta feedbacks automáticos. Estes números ajudam a identificar oportunidades de melhoria na jornada antes da transferência para o time humano.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 lg:w-1/2">
                    <div className="rounded-lg bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800/40 p-4 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Satisfeito</p>
                      <p className="text-lg font-semibold text-foreground">{(iaAnalyst.satisfeito || 0).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="rounded-lg bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800/40 p-4 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Pouco</p>
                      <p className="text-lg font-semibold text-foreground">{(iaAnalyst.poucoSatisfeito || 0).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="rounded-lg bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800/40 p-4 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Insatisfeito</p>
                      <p className="text-lg font-semibold text-foreground">{(iaAnalyst.insatisfeito || 0).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
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
