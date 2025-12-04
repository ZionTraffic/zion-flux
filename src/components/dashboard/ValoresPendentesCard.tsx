import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Clock, User, Bot } from 'lucide-react';

interface ValoresPendentesProps {
  valorPendente: number;
  valorRecuperado: number;
  valorEmNegociacao: number;
  metaMensal?: number;
  isLoading?: boolean;
  valorRecuperadoHumano?: number;
  valorRecuperadoIA?: number;
}

export function ValoresPendentesCard({
  valorPendente = 0,
  valorRecuperado = 0,
  valorEmNegociacao = 0,
  metaMensal = 0,
  isLoading = false,
  valorRecuperadoHumano = 0,
  valorRecuperadoIA = 0,
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
          <p className="text-sm text-muted-foreground">Pendentes e Recuperados</p>
        </div>
      </div>

      {/* Cards de Valores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
      </div>

      {/* Recuperação por Humano e IA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recuperado por Humano */}
        <div 
          className={`relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-300 ${
            hoveredCard === 'humano' ? 'border-blue-400 shadow-xl scale-105' : 'border-blue-200'
          } bg-gradient-to-br from-blue-50 to-white`}
          onMouseEnter={() => setHoveredCard('humano')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 uppercase font-semibold tracking-wider mb-1">Recuperado por Humano</p>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(valorRecuperadoHumano)}</p>
          <p className="text-xs text-blue-500 mt-2">Atendimento manual</p>
        </div>

        {/* Recuperado por IA */}
        <div 
          className={`relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-300 ${
            hoveredCard === 'ia' ? 'border-purple-400 shadow-xl scale-105' : 'border-purple-200'
          } bg-gradient-to-br from-purple-50 to-white`}
          onMouseEnter={() => setHoveredCard('ia')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-xs text-purple-600 uppercase font-semibold tracking-wider mb-1">Recuperado por IA</p>
          <p className="text-2xl font-bold text-purple-700">{formatCurrency(valorRecuperadoIA)}</p>
          <p className="text-xs text-purple-500 mt-2">Atendimento automatizado</p>
        </div>
      </div>
    </div>
  );
}
