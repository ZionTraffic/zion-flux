import { useState } from 'react';
import { CSATTotals, CSATFeedback } from '@/hooks/useCSATData';
import { CSATDistributionChart } from './charts/CSATDistributionChart';
import { CSATFeedbackList } from './CSATFeedbackList';
import { Search } from 'lucide-react';

interface CSATData {
  analista: string;
  csatMedio: number;
  totalAtendimentos: number;
  nota1: number;
  nota2: number;
  nota3: number;
  nota4: number;
  nota5: number;
  satisfeito?: number;
  poucoSatisfeito?: number;
  insatisfeito?: number;
}

interface CSATAnalystTableProps {
  data: CSATData[];
  totals?: CSATTotals;
  feedbacks?: CSATFeedback[];
  isLoading?: boolean;
  dateRange?: { from?: Date; to?: Date };
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;
}

// Função para obter cor baseada na nota (1-2 vermelho, 3 amarelo, 4-5 verde)
const getNotaColor = (nota: number) => {
  if (nota >= 4) return { bg: 'bg-emerald-500', text: 'text-emerald-500', gradient: 'from-emerald-500 to-emerald-600' };
  if (nota === 3) return { bg: 'bg-amber-500', text: 'text-amber-500', gradient: 'from-amber-500 to-amber-600' };
  return { bg: 'bg-red-500', text: 'text-red-500', gradient: 'from-red-500 to-red-600' };
};

// Função para obter cor do CSAT médio
const getCsatMedioColor = (media: number) => {
  if (media >= 4) return 'text-emerald-600';
  if (media >= 3) return 'text-amber-600';
  return 'text-red-600';
};

// Opções de filtro rápido
const quickFilters = [
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
  { label: 'Este mês', days: 0 }, // 0 = mês atual
];

export function CSATAnalystTable({ data, totals, feedbacks = [], isLoading = false, dateRange, onDateRangeChange }: CSATAnalystTableProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [feedbackSearch, setFeedbackSearch] = useState('');

  // Função para aplicar filtro rápido
  const applyQuickFilter = (days: number, label: string) => {
    if (!onDateRangeChange) return;
    
    const now = new Date();
    let from: Date;
    let to: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (days === 0) {
      // Este mês
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // Últimos X dias
      from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    setActiveFilter(label);
    onDateRangeChange({ from, to });
  };

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

  // Usar apenas dados reais
  const displayData = data;

  // Verificar se é IA (pode ser "IA", "IA Maria", ou conter "ia" no nome)
  const isIaAnalyst = (analista: string) => {
    const lower = analista.toLowerCase();
    return lower === 'ia' || lower === 'ia maria' || lower.includes('ia ');
  };

  const humanAnalysts = displayData.filter((item) => !isIaAnalyst(item.analista));
  const iaAnalyst = displayData.find((item) => isIaAnalyst(item.analista));

  // Usar totals do hook ou calcular localmente
  const csatMedioGeral = totals?.csatMedioGeral || (displayData.length > 0 
    ? displayData.reduce((acc, item) => acc + (item.csatMedio * item.totalAtendimentos), 0) / displayData.reduce((acc, item) => acc + item.totalAtendimentos, 0)
    : 0);
    
  const totalAvaliacoes = totals?.totalAvaliacoes || displayData.reduce((sum, item) => sum + item.totalAtendimentos, 0);
  
  const distribuicao = totals?.distribuicao || (displayData.length > 0 ? {
    nota1: displayData.reduce((acc, item) => acc + item.nota1, 0),
    nota2: displayData.reduce((acc, item) => acc + item.nota2, 0),
    nota3: displayData.reduce((acc, item) => acc + item.nota3, 0),
    nota4: displayData.reduce((acc, item) => acc + item.nota4, 0),
    nota5: displayData.reduce((acc, item) => acc + item.nota5, 0),
  } : { nota1: 0, nota2: 0, nota3: 0, nota4: 0, nota5: 0 });

  // Métricas separadas por origem (Humano vs IA)
  const humanStats = {
    total: humanAnalysts.reduce((sum, item) => sum + item.totalAtendimentos, 0),
    media: humanAnalysts.length > 0 
      ? humanAnalysts.reduce((sum, item) => sum + (item.csatMedio * item.totalAtendimentos), 0) / 
        humanAnalysts.reduce((sum, item) => sum + item.totalAtendimentos, 0) || 0
      : 0,
    distribuicao: humanAnalysts.reduce((acc, item) => ({
      nota1: acc.nota1 + item.nota1,
      nota2: acc.nota2 + item.nota2,
      nota3: acc.nota3 + item.nota3,
      nota4: acc.nota4 + item.nota4,
      nota5: acc.nota5 + item.nota5,
    }), { nota1: 0, nota2: 0, nota3: 0, nota4: 0, nota5: 0 }),
  };

  const iaStats = iaAnalyst ? {
    total: iaAnalyst.totalAtendimentos,
    media: iaAnalyst.csatMedio,
    distribuicao: {
      nota1: iaAnalyst.nota1,
      nota2: iaAnalyst.nota2,
      nota3: iaAnalyst.nota3,
      nota4: iaAnalyst.nota4,
      nota5: iaAnalyst.nota5,
    },
  } : null;

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
        {/* Header com Filtros Rápidos */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
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

          {/* Filtros Rápidos */}
          {onDateRangeChange && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium mr-1">Período:</span>
              {quickFilters.map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => applyQuickFilter(filter.days, filter.label)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    activeFilter === filter.label
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {sectionsEmpty ? (
          <div className="text-center py-16 px-6 rounded-2xl bg-muted/5 border border-dashed border-muted-foreground/20">
            <div className="text-6xl mb-4 opacity-30">📊</div>
            <p className="text-lg text-muted-foreground">Nenhum dado de CSAT disponível para este período</p>
          </div>
        ) : (
          <>
            {/* Gráfico de Distribuição por Nota */}
            <div className="mb-10 p-6 rounded-2xl border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-foreground">Distribuição por Nota</h4>
                  <p className="text-sm text-muted-foreground">Quantidade de avaliações por nota (1 a 5)</p>
                </div>
              </div>
              <CSATDistributionChart 
                distribuicao={distribuicao} 
                totalAvaliacoes={totalAvaliacoes} 
              />
            </div>

            {/* CSAT por Origem - Comparativo IA vs Humano */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-foreground">CSAT por Origem do Atendimento</h4>
                  <p className="text-sm text-muted-foreground">Comparativo entre atendimento humano e IA</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card Atendimento Humano */}
                <div className="p-6 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-lg font-bold text-emerald-800">Atendimento Humano</h5>
                      <p className="text-sm text-emerald-600">{humanAnalysts.length} analistas</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 rounded-xl bg-white/80 border border-emerald-200">
                      <p className="text-xs text-emerald-600 uppercase font-semibold mb-1">CSAT Médio</p>
                      <p className={`text-3xl font-bold ${getCsatMedioColor(humanStats.media)}`}>
                        {humanStats.media.toFixed(1)}<span className="text-lg text-gray-400">/5</span>
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/80 border border-emerald-200">
                      <p className="text-xs text-emerald-600 uppercase font-semibold mb-1">Total Avaliações</p>
                      <p className="text-3xl font-bold text-emerald-700">{humanStats.total}</p>
                    </div>
                  </div>

                  {/* Mini distribuição */}
                  <div className="flex gap-1 justify-center">
                    {[5, 4, 3, 2, 1].map((nota) => {
                      const count = humanStats.distribuicao[`nota${nota}` as keyof typeof humanStats.distribuicao];
                      const color = getNotaColor(nota);
                      return (
                        <div key={nota} className={`px-2 py-1 rounded ${color.bg}/20 ${color.text} text-xs font-bold`} title={`Nota ${nota}`}>
                          {nota}: {count}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Atendimento IA */}
                <div className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-lg font-bold text-blue-800">Atendimento IA</h5>
                      <p className="text-sm text-blue-600">Automação</p>
                    </div>
                  </div>
                  
                  {iaStats ? (
                    <>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 rounded-xl bg-white/80 border border-blue-200">
                          <p className="text-xs text-blue-600 uppercase font-semibold mb-1">CSAT Médio</p>
                          <p className={`text-3xl font-bold ${getCsatMedioColor(iaStats.media)}`}>
                            {iaStats.media.toFixed(1)}<span className="text-lg text-gray-400">/5</span>
                          </p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-white/80 border border-blue-200">
                          <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Total Avaliações</p>
                          <p className="text-3xl font-bold text-blue-700">{iaStats.total}</p>
                        </div>
                      </div>

                      {/* Mini distribuição */}
                      <div className="flex gap-1 justify-center">
                        {[5, 4, 3, 2, 1].map((nota) => {
                          const count = iaStats.distribuicao[`nota${nota}` as keyof typeof iaStats.distribuicao];
                          const color = getNotaColor(nota);
                          return (
                            <div key={nota} className={`px-2 py-1 rounded ${color.bg}/20 ${color.text} text-xs font-bold`} title={`Nota ${nota}`}>
                              {nota}: {count}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 text-blue-400">
                      <p>Sem avaliações de IA no período</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Premium Stats Cards - CSAT 1-5 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* CSAT Médio Geral */}
              <div 
                className="group relative overflow-hidden rounded-2xl p-6 border border-gray-200 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer bg-white"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${getNotaColor(csatMedioGeral).gradient} flex items-center justify-center shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
                      <span className="text-2xl font-bold text-white drop-shadow-lg">{csatMedioGeral.toFixed(1)}</span>
                    </div>
                    <div className={`h-3 w-3 rounded-full ${getNotaColor(csatMedioGeral).bg} animate-pulse shadow-lg`} />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground/70 mb-2 font-semibold">CSAT Médio Geral</p>
                  <p className={`text-xl font-bold ${getCsatMedioColor(csatMedioGeral)}`}>{csatMedioGeral.toFixed(1)} / 5</p>
                </div>
              </div>

              {/* Total Avaliações */}
              <div 
                className="group relative overflow-hidden rounded-2xl p-6 border border-gray-200 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer bg-white"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                      <span className="text-2xl font-bold text-white drop-shadow-lg">{totalAvaliacoes}</span>
                    </div>
                    <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground/70 mb-2 font-semibold">Total de Avaliações</p>
                  <p className="text-base font-bold text-foreground">No período selecionado</p>
                </div>
              </div>

              {/* Distribuição por Nota 1-5 */}
              <div 
                className="group relative overflow-hidden rounded-2xl p-6 border border-gray-200 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer bg-white"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex gap-1">
                      {[5, 4, 3, 2, 1].map((nota) => {
                        const count = distribuicao[`nota${nota}` as keyof typeof distribuicao];
                        const color = getNotaColor(nota);
                        return (
                          <div 
                            key={nota}
                            className={`h-10 w-10 rounded-lg ${color.bg}/20 flex flex-col items-center justify-center backdrop-blur-sm border ${color.bg}/30 transform group-hover:scale-110 transition-transform duration-300`}
                            title={`Nota ${nota}: ${count} avaliações`}
                          >
                            <span className={`text-xs font-bold ${color.text}`}>{nota}</span>
                            <span className={`text-[10px] ${color.text}`}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground/70 mb-2 font-semibold">Distribuição por Nota</p>
                  <p className="text-base font-bold text-foreground">Notas 1 a 5</p>
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
                    // Calcular percentuais por nota
                    const perc5 = total > 0 ? (item.nota5 / total) * 100 : 0;
                    const perc4 = total > 0 ? (item.nota4 / total) * 100 : 0;
                    const perc3 = total > 0 ? (item.nota3 / total) * 100 : 0;
                    const perc2 = total > 0 ? (item.nota2 / total) * 100 : 0;
                    const perc1 = total > 0 ? (item.nota1 / total) * 100 : 0;

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
                              <p className="text-xs text-muted-foreground/60 mb-1">CSAT Médio</p>
                              <p className={`text-2xl font-bold ${getCsatMedioColor(item.csatMedio)}`}>
                                {item.csatMedio.toFixed(1)}<span className="text-sm text-muted-foreground">/5</span>
                              </p>
                            </div>
                          </div>

                          {/* Barra de distribuição por nota */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-0.5 h-10 rounded-xl overflow-hidden bg-muted/20 flex-1 shadow-inner">
                              {perc5 > 0 && (
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold transition-all duration-500 shadow-lg"
                                  style={{ width: `${perc5}%` }}
                                  title={`Nota 5: ${item.nota5}`}
                                >
                                  {perc5 >= 15 && `5`}
                                </div>
                              )}
                              {perc4 > 0 && (
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold transition-all duration-500 shadow-lg"
                                  style={{ width: `${perc4}%` }}
                                  title={`Nota 4: ${item.nota4}`}
                                >
                                  {perc4 >= 15 && `4`}
                                </div>
                              )}
                              {perc3 > 0 && (
                                <div
                                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold transition-all duration-500 shadow-lg"
                                  style={{ width: `${perc3}%` }}
                                  title={`Nota 3: ${item.nota3}`}
                                >
                                  {perc3 >= 15 && `3`}
                                </div>
                              )}
                              {perc2 > 0 && (
                                <div
                                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold transition-all duration-500 shadow-lg"
                                  style={{ width: `${perc2}%` }}
                                  title={`Nota 2: ${item.nota2}`}
                                >
                                  {perc2 >= 15 && `2`}
                                </div>
                              )}
                              {perc1 > 0 && (
                                <div
                                  className="h-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white text-xs font-bold transition-all duration-500 shadow-lg"
                                  style={{ width: `${perc1}%` }}
                                  title={`Nota 1: ${item.nota1}`}
                                >
                                  {perc1 >= 15 && `1`}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground/70">
                              <span className="font-semibold text-foreground">{total}</span> aval.
                            </div>
                          </div>

                          {/* Distribuição por nota */}
                          <div className="flex justify-between text-xs text-muted-foreground/80 flex-wrap gap-2">
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                              5: <span className="font-semibold text-foreground">{item.nota5}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                              4: <span className="font-semibold text-foreground">{item.nota4}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                              3: <span className="font-semibold text-foreground">{item.nota3}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                              2: <span className="font-semibold text-foreground">{item.nota2}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                              1: <span className="font-semibold text-foreground">{item.nota1}</span>
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
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold ${getCsatMedioColor(iaAnalyst.csatMedio)}`}>
                      {iaAnalyst.csatMedio.toFixed(1)}/5
                    </div>
                    <div className="text-sm text-muted-foreground/70 font-semibold">
                      {iaAnalyst.totalAtendimentos.toLocaleString('pt-BR')} avaliações
                    </div>
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
                    {/* Distribuição por nota 1-5 para IA */}
                    <div className="grid grid-cols-5 gap-3 lg:w-1/2">
                      {[5, 4, 3, 2, 1].map((nota) => {
                        const count = iaAnalyst[`nota${nota}` as keyof typeof iaAnalyst] as number || 0;
                        const color = getNotaColor(nota);
                        const bgColors: Record<number, string> = {
                          5: 'rgba(16,185,129,0.15)',
                          4: 'rgba(52,211,153,0.15)',
                          3: 'rgba(245,158,11,0.15)',
                          2: 'rgba(249,115,22,0.15)',
                          1: 'rgba(239,68,68,0.15)'
                        };
                        const borderColors: Record<number, string> = {
                          5: 'rgba(16,185,129,0.3)',
                          4: 'rgba(52,211,153,0.3)',
                          3: 'rgba(245,158,11,0.3)',
                          2: 'rgba(249,115,22,0.3)',
                          1: 'rgba(239,68,68,0.3)'
                        };
                        return (
                          <div 
                            key={nota}
                            className="rounded-xl p-4 text-center shadow-xl hover:scale-105 transition-all duration-300 border-2" 
                            style={{
                              background: `linear-gradient(135deg, ${bgColors[nota]} 0%, ${bgColors[nota].replace('0.15', '0.08')} 100%)`,
                              backdropFilter: 'blur(10px)',
                              borderColor: borderColors[nota]
                            }}
                          >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color.gradient} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                              <span className="text-lg font-bold text-white">{nota}</span>
                            </div>
                            <p className={`text-xs uppercase tracking-wider ${color.text} font-bold mb-1`}>Nota {nota}</p>
                            <p className={`text-2xl font-bold ${color.text}`}>{count.toLocaleString('pt-BR')}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Seção de Justificativas/Feedbacks */}
            <div className="mt-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground">Justificativas dos Clientes</h4>
                    <p className="text-sm text-muted-foreground">{feedbacks.length} comentários registrados</p>
                  </div>
                </div>

                {/* Campo de Busca */}
                <div className="relative w-full md:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nome ou analista..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm shadow-sm"
                    value={feedbackSearch}
                    onChange={(e) => setFeedbackSearch(e.target.value)}
                  />
                </div>
              </div>
              <CSATFeedbackList feedbacks={feedbacks} maxVisible={5} searchTerm={feedbackSearch} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
