import { cn } from "@/lib/utils";

interface AtendimentosKpiCardsProps {
  atendimentosHoje: number;
  atendimentosIA: number;
  percentualIA: number;
  atendimentosTransferidos: number;
  isLoading?: boolean;
}

export function AtendimentosKpiCards({
  atendimentosHoje,
  atendimentosIA,
  percentualIA,
  atendimentosTransferidos,
  isLoading = false,
}: AtendimentosKpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium animate-pulse">
          <div className="h-20 bg-muted/20 rounded"></div>
        </div>
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium animate-pulse">
          <div className="h-20 bg-muted/20 rounded"></div>
        </div>
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium animate-pulse">
          <div className="h-20 bg-muted/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card: Atendimentos Totais */}
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl p-6",
          "glass border border-border/50",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-300",
          "hover:scale-105",
          "cursor-pointer"
        )}
      >
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
          style={{ 
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Atendimentos Totais
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold tracking-tight text-foreground">
              {atendimentosHoje.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-muted-foreground">atendimentos</p>
          </div>

          {/* Mini sparkline */}
          <div className="mt-4 h-8 flex items-end gap-1">
            {[...Array(12)].map((_, i) => {
              const height = Math.random() * 100;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all duration-300 bg-blue-500/30"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Card: Atendimentos IA */}
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl p-6",
          "glass border border-border/50",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-300",
          "hover:scale-105",
          "cursor-pointer"
        )}
      >
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
          style={{ 
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Atendimentos IA
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold tracking-tight text-foreground">
              {atendimentosIA.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-muted-foreground">
              ({percentualIA.toFixed(1)}%)
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Respondidos pela IA (T2)</span>
              <span className="font-bold text-purple-600">{percentualIA.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(percentualIA, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card: Transferidos */}
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl p-6",
          "glass border border-border/50",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-300",
          "hover:scale-105",
          "cursor-pointer"
        )}
      >
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
          style={{ 
            background: 'linear-gradient(135deg, #10b981, #059669)',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Transferidos
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold tracking-tight text-foreground">
              {atendimentosTransferidos.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-muted-foreground">
              ({atendimentosHoje > 0 ? ((atendimentosTransferidos / atendimentosHoje) * 100).toFixed(1) : 0}%)
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Transferidos para humano</span>
              <span className="font-bold text-emerald-600">
                {atendimentosHoje > 0 ? ((atendimentosTransferidos / atendimentosHoje) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${atendimentosHoje > 0 ? Math.min((atendimentosTransferidos / atendimentosHoje) * 100, 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
