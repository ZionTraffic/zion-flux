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

  // Somar as categorias de CSAT (não totalAtendimentos para evitar duplicação)
  const totalSatisfeito = data.reduce((total, item) => total + (item.satisfeito || 0), 0);
  const totalPouco = data.reduce((total, item) => total + (item.poucoSatisfeito || 0), 0);
  const totalInsatisfeito = data.reduce((total, item) => total + (item.insatisfeito || 0), 0);
  
  // Total real de respostas = soma das 3 categorias
  const totalRespostas = totalSatisfeito + totalPouco + totalInsatisfeito;
  const satisfacaoGeral = totalRespostas > 0 ? (totalSatisfeito / totalRespostas) * 100 : 0;

  const sectionsEmpty = humanAnalysts.length === 0 && !iaAnalyst;

  const getRankBadge = (position: number) => {
    const badges = {
      1: <div className="relative"><div className="absolute inset-0 bg-amber-500/40 blur-lg animate-pulse" /><span className="relative text-2xl font-bold text-amber-500 drop-shadow-lg">#1</span></div>,
      2: <div className="relative"><div className="absolute inset-0 bg-gray-400/40 blur-lg animate-pulse" /><span className="relative text-2xl font-bold text-gray-400 drop-shadow-lg">#2</span></div>,
      3: <div className="relative"><div className="absolute inset-0 bg-amber-700/40 blur-lg animate-pulse" /><span className="relative text-2xl font-bold text-amber-700 drop-shadow-lg">#3</span></div>
    };
    
    return badges[position as keyof typeof badges] || (
      <span className="text-lg font-semibold text-muted-foreground">{position}º</span>
    );
  };

  if (isLoading) {
    return (
      <div className="glass rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl p-8 border border-gray-200 shadow-2xl bg-white" style={{
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
    }}>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/30 blur-xl rounded-full animate-pulse" />
            <svg className="relative w-10 h-10 text-amber-500 drop-shadow-2xl" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
              CSAT por Analista
            </h3>
            <p className="text-sm text-muted-foreground/80 mt-1">{mesAtual}</p>
          </div>
        </div>

        {sectionsEmpty ? (
          <div className="text-center py-16 px-6 rounded-2xl bg-muted/5 border border-dashed border-muted-foreground/20">
            <div className="text-6xl mb-4 opacity-30">📊</div>
            <p className="text-lg text-muted-foreground">Nenhum dado de CSAT disponível para este período</p>
          </div>
        ) : (
          <>
            {/* Premium Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Total Avaliações */}
              <div 
                className="group relative overflow-hidden rounded-2xl p-6 border border-gray-200 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer bg-white"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                      <span className="text-2xl font-bold text-white drop-shadow-lg">{totalRespostas}</span>
                    </div>
                    <div className="h-3 w-3 rounded-full bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50" />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground/70 mb-2 font-semibold">Total de Avaliações</p>
                  <p className="text-base font-bold text-foreground">Últimos 90 dias</p>
                </div>
              </div>

              {/* Satisfação Geral */}
              <div 
                className="group relative overflow-hidden rounded-2xl p-6 border border-gray-200 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer bg-white"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                      <span className="text-2xl font-bold text-white drop-shadow-lg">{Math.round(satisfacaoGeral)}%</span>
                    </div>
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground/70 mb-2 font-semibold">Satisfação Geral</p>
                  <p className="text-base font-bold text-foreground">{totalSatisfeito} positivas</p>
                </div>
              </div>

              {/* Distribuição */}
              <div 
                className="group relative overflow-hidden rounded-2xl p-6 border border-gray-200 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer bg-white"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex gap-2">
                      <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center backdrop-blur-sm border border-emerald-500/30 transform group-hover:scale-110 transition-transform duration-300">
                        <span className="text-base font-bold text-emerald-500">{totalSatisfeito}</span>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center backdrop-blur-sm border border-blue-500/30 transform group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: '50ms' }}>
                        <span className="text-base font-bold text-blue-500">{totalPouco}</span>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center backdrop-blur-sm border border-red-500/30 transform group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: '100ms' }}>
                        <span className="text-base font-bold text-red-500">{totalInsatisfeito}</span>
                      </div>
                    </div>
                    <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground/70 mb-2 font-semibold">Distribuição</p>
                  <p className="text-base font-bold text-foreground">Por categoria</p>
                </div>
              </div>
            </div>

            {/* Analistas Humanos */}
            {humanAnalysts.length > 0 && (
              <div className="space-y-6 mb-10">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-1">Atendimento Humano</h4>
                    <p className="text-sm text-muted-foreground/80">Ranking dos analistas e desempenho por categoria</p>
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
                        className="group relative overflow-hidden rounded-2xl p-6 border border-gray-200 transition-all duration-500 cursor-pointer bg-white"
                        style={{
                          transform: hoveredCard === item.analista ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                          boxShadow: hoveredCard === item.analista 
                            ? '0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(59,130,246,0.2)'
                            : '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                      >
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-4">
                              {getRankBadge(index + 1)}
                              <div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1">Analista</p>
                                <p className="text-xl font-bold text-foreground">{item.analista}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground/60 mb-1">Atendimentos</p>
                              <p className="text-lg font-bold text-foreground">{total.toLocaleString('pt-BR')}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-1 h-10 rounded-xl overflow-hidden bg-muted/20 flex-1 shadow-inner">
                              {percSatisfeito > 0 && (
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold transition-all duration-500 shadow-lg"
                                  style={{ width: `${percSatisfeito}%` }}
                                >
                                  {percSatisfeito >= 20 && `${satisfeito}`}
                                </div>
                              )}
                              {percPoucoSatisfeito > 0 && (
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold transition-all duration-500 shadow-lg"
                                  style={{ width: `${percPoucoSatisfeito}%` }}
                                >
                                  {percPoucoSatisfeito >= 20 && `${poucoSatisfeito}`}
                                </div>
                              )}
                              {percInsatisfeito > 0 && (
                                <div
                                  className="h-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold transition-all duration-500 shadow-lg"
                                  style={{ width: `${percInsatisfeito}%` }}
                                >
                                  {percInsatisfeito >= 20 && `${insatisfeito}`}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end text-xs text-muted-foreground/70">
                              <span className="uppercase tracking-wider">CSAT médio</span>
                              <span className="text-lg font-bold text-foreground mt-1">
                                {item.csatMedio.toFixed(1)}<span className="text-sm text-muted-foreground">/5</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between text-xs text-muted-foreground/80">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                              Satisfeito: <span className="font-semibold text-foreground">{satisfeito}</span> ({percSatisfeito.toFixed(0)}%)
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
                              Pouco: <span className="font-semibold text-foreground">{poucoSatisfeito}</span> ({percPoucoSatisfeito.toFixed(0)}%)
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
                              Insatisfeito: <span className="font-semibold text-foreground">{insatisfeito}</span> ({percInsatisfeito.toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Assistente IA */}
            {iaAnalyst && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-1">Assistente IA</h4>
                    <p className="text-sm text-muted-foreground/80">Feedbacks recebidos diretamente pela automação</p>
                  </div>
                  <div className="text-sm text-muted-foreground/70 font-semibold">
                    {iaAnalyst.totalAtendimentos.toLocaleString('pt-BR')} avaliações
                  </div>
                </div>

                <div 
                  className="relative overflow-hidden rounded-2xl p-8 border border-dashed border-blue-500/40 shadow-xl bg-white"
                >
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">IA</p>
                          <p className="text-xs text-muted-foreground/70 uppercase tracking-wider">Atendimento Automatizado</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground/80 max-w-md leading-relaxed">
                        A IA participa do atendimento inicial e coleta feedbacks automáticos. Estes números ajudam a identificar oportunidades de melhoria na jornada antes da transferência para o time humano.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 lg:w-1/2">
                      <div className="rounded-xl p-5 text-center shadow-xl hover:scale-105 transition-all duration-300 border-2" style={{
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%)',
                        backdropFilter: 'blur(10px)',
                        borderColor: 'rgba(16,185,129,0.3)'
                      }}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mb-2">Satisfeito</p>
                        <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{(iaAnalyst.satisfeito || 0).toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="rounded-xl p-5 text-center shadow-xl hover:scale-105 transition-all duration-300 border-2" style={{
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.08) 100%)',
                        backdropFilter: 'blur(10px)',
                        borderColor: 'rgba(59,130,246,0.3)',
                        transitionDelay: '50ms'
                      }}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold mb-2">Pouco</p>
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{(iaAnalyst.poucoSatisfeito || 0).toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="rounded-xl p-5 text-center shadow-xl hover:scale-105 transition-all duration-300 border-2" style={{
                        background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.08) 100%)',
                        backdropFilter: 'blur(10px)',
                        borderColor: 'rgba(239,68,68,0.3)',
                        transitionDelay: '100ms'
                      }}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-xs uppercase tracking-wider text-red-600 dark:text-red-400 font-bold mb-2">Insatisfeito</p>
                        <p className="text-3xl font-bold text-red-700 dark:text-red-300">{(iaAnalyst.insatisfeito || 0).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Legenda */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-4 font-semibold">Legenda das Categorias:</p>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30"></div>
              <span className="text-muted-foreground font-medium">Satisfeito</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"></div>
              <span className="text-muted-foreground font-medium">Pouco Satisfeito</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30"></div>
              <span className="text-muted-foreground font-medium">Insatisfeito</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
