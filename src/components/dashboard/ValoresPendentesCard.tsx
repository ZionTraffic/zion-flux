import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ValoresPendentesProps {
  valorPendente: number;
  valorRecuperado: number;
  valorEmNegociacao: number;
  metaMensal?: number;
  isLoading?: boolean;
}

export function ValoresPendentesCard({
  valorPendente = 0,
  valorRecuperado = 0,
  valorEmNegociacao = 0,
  metaMensal = 0,
  isLoading = false,
}: ValoresPendentesProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const taxaRecuperacao = valorPendente > 0 
    ? ((valorRecuperado / (valorPendente + valorRecuperado)) * 100).toFixed(1)
    : 0;

  const progressoMeta = metaMensal > 0 
    ? Math.min((valorRecuperado / metaMensal) * 100, 100).toFixed(1)
    : 0;

  if (isLoading) {
    return (
      <div className="rounded-3xl p-8 border border-gray-200 shadow-2xl bg-white">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-xl w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-8 border border-gray-200 shadow-2xl bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/30 blur-xl rounded-full animate-pulse" />
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Valores Financeiros</h3>
          <p className="text-sm text-muted-foreground">Pendentes, Recuperados e Em Negociação</p>
        </div>
      </div>

      {/* Cards de Valores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Valor Pendente */}
        <div 
          className={`relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-300 ${
            hoveredCard === 'pendente' ? 'border-red-400 shadow-xl scale-105' : 'border-red-200'
          } bg-gradient-to-br from-red-50 to-white`}
          onMouseEnter={() => setHoveredCard('pendente')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-xs text-red-600 uppercase font-semibold tracking-wider mb-1">Valor Pendente</p>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(valorPendente)}</p>
          <p className="text-xs text-red-500 mt-2">Aguardando pagamento</p>
        </div>

        {/* Valor Recuperado */}
        <div 
          className={`relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-300 ${
            hoveredCard === 'recuperado' ? 'border-emerald-400 shadow-xl scale-105' : 'border-emerald-200'
          } bg-gradient-to-br from-emerald-50 to-white`}
          onMouseEnter={() => setHoveredCard('recuperado')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-xs text-emerald-600 uppercase font-semibold tracking-wider mb-1">Valor Recuperado</p>
          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(valorRecuperado)}</p>
          <p className="text-xs text-emerald-500 mt-2">Pagamentos recebidos</p>
        </div>

        {/* Em Negociação */}
        <div 
          className={`relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-300 ${
            hoveredCard === 'negociacao' ? 'border-amber-400 shadow-xl scale-105' : 'border-amber-200'
          } bg-gradient-to-br from-amber-50 to-white`}
          onMouseEnter={() => setHoveredCard('negociacao')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Em andamento</span>
          </div>
          <p className="text-xs text-amber-600 uppercase font-semibold tracking-wider mb-1">Em Negociação</p>
          <p className="text-2xl font-bold text-amber-700">{formatCurrency(valorEmNegociacao)}</p>
          <p className="text-xs text-amber-500 mt-2">Acordos em processo</p>
        </div>
      </div>

      {/* Barra de Progresso e Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Taxa de Recuperação */}
        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Taxa de Recuperação</p>
            <span className={`text-lg font-bold ${Number(taxaRecuperacao) >= 50 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {taxaRecuperacao}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                Number(taxaRecuperacao) >= 50 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'
              }`}
              style={{ width: `${taxaRecuperacao}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {formatCurrency(valorRecuperado)} de {formatCurrency(valorPendente + valorRecuperado)} total
          </p>
        </div>

        {/* Progresso da Meta */}
        {metaMensal > 0 && (
          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-blue-700">Progresso da Meta Mensal</p>
              <span className={`text-lg font-bold ${Number(progressoMeta) >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                {progressoMeta}%
              </span>
            </div>
            <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  Number(progressoMeta) >= 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-blue-400'
                }`}
                style={{ width: `${progressoMeta}%` }}
              />
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Meta: {formatCurrency(metaMensal)}
            </p>
          </div>
        )}
      </div>

      {/* Dica */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-800">Dica de Recuperação</p>
          <p className="text-xs text-blue-600 mt-1">
            Priorize contatos com valores em negociação para aumentar a taxa de recuperação. 
            Clientes com acordos em andamento têm maior probabilidade de pagamento.
          </p>
        </div>
      </div>
    </div>
  );
}
