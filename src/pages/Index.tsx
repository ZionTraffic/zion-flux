import { Header } from "@/components/ui/Header";
import { KpiCard } from "@/components/ui/KpiCard";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import { DataTable } from "@/components/tables/DataTable";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { useSupabaseDiagnostics } from "@/hooks/useSupabaseDiagnostics";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [workspaceId, setWorkspaceId] = useState("3f14bb25-0eda-4c58-8486-16b96dca6f9e");
  const diagnostics = useSupabaseDiagnostics();
  const { totals, daily, loading, lastUpdate, refetch } = useAnalyticsData(workspaceId);

  // Diagnóstico em andamento
  if (diagnostics.status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass rounded-2xl p-8 border border-border/50 max-w-md w-full text-center">
          <div className="animate-pulse text-center">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-muted-foreground">{diagnostics.details}</p>
          </div>
        </div>
      </div>
    );
  }

  // Diagnóstico falhou
  if (diagnostics.status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass rounded-2xl p-8 border border-destructive/50 bg-destructive/5 max-w-md w-full">
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-destructive">Erro de Conexão</h2>
            <p className="text-sm text-muted-foreground">{diagnostics.details}</p>
            {diagnostics.errorType === "rpc" && (
              <p className="text-xs text-muted-foreground mt-2">
                Verifique se a função RPC 'kpi_totais_periodo' existe no seu banco Supabase.
              </p>
            )}
            {diagnostics.errorType === "tables" && (
              <p className="text-xs text-muted-foreground mt-2">
                Verifique se as tabelas necessárias existem e você tem permissões de acesso.
              </p>
            )}
            {diagnostics.errorType === "connection" && (
              <p className="text-xs text-muted-foreground mt-2">
                Verifique sua conexão de internet e as configurações do Supabase.
              </p>
            )}
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              className="mt-4"
            >
              🔁 Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Carregando dados do dashboard
  if (loading || !totals) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      id: 'leads',
      label: 'Leads Recebidos',
      value: totals.leads_recebidos.toLocaleString('pt-BR'),
      icon: '⚡',
      gradient: 'rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)',
      trend: { value: 12.5, isPositive: true },
      delay: 0,
    },
    {
      id: 'qualified',
      label: 'Qualificados',
      value: totals.leads_qualificados.toLocaleString('pt-BR'),
      icon: '✓',
      gradient: 'rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05)',
      trend: { value: 8.3, isPositive: true },
      delay: 0.05,
    },
    {
      id: 'followup',
      label: 'Follow-up',
      value: totals.leads_followup.toLocaleString('pt-BR'),
      icon: '↻',
      gradient: 'rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05)',
      trend: { value: 5.1, isPositive: false },
      delay: 0.1,
    },
    {
      id: 'discarded',
      label: 'Descartados',
      value: totals.leads_descartados.toLocaleString('pt-BR'),
      icon: '✕',
      gradient: 'rgba(71, 85, 105, 0.1), rgba(71, 85, 105, 0.05)',
      trend: { value: 2.8, isPositive: false },
      delay: 0.15,
    },
    {
      id: 'investment',
      label: 'Investimento',
      value: `R$ ${totals.investimento.toLocaleString('pt-BR')}`,
      icon: 'R$',
      gradient: 'rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)',
      trend: { value: 15.2, isPositive: true },
      delay: 0.2,
    },
    {
      id: 'cpl',
      label: 'CPL Médio',
      value: `R$ ${totals.cpl.toFixed(2)}`,
      icon: '◎',
      gradient: 'rgba(236, 72, 153, 0.1), rgba(236, 72, 153, 0.05)',
      trend: { value: 3.5, isPositive: false },
      delay: 0.25,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header 
        onRefresh={refetch} 
        isRefreshing={loading} 
        lastUpdate={lastUpdate}
        currentWorkspace={workspaceId}
        onWorkspaceChange={setWorkspaceId}
      />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpiCards.map((card) => (
            <KpiCard
              key={card.id}
              label={card.label}
              value={card.value}
              icon={card.icon}
              gradient={card.gradient}
              trend={card.trend}
              delay={card.delay}
            />
          ))}
        </div>

        {/* Analytics Chart */}
        <AnalyticsChart data={daily} />

        {/* Data Table */}
        <DataTable workspaceId={workspaceId} />
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-6 mt-12">
        <div className="glass rounded-2xl p-6 text-center border border-border/50">
          <p className="text-sm text-muted-foreground">
            Zion App &copy; 2025 - Premium Analytics Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
