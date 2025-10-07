import { Header } from "@/components/ui/Header";
import { KpiCard } from "@/components/ui/KpiCard";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import { DataTable } from "@/components/tables/DataTable";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { useSupabaseDiagnostics } from "@/hooks/useSupabaseDiagnostics";
import { useSupabaseConnectionTest } from "@/hooks/useSupabaseConnectionTest";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const Index = () => {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspace();
  const diagnostics = useSupabaseDiagnostics();
  const { totals, daily, loading, lastUpdate, refetch } = useAnalyticsData(currentWorkspaceId || '');
  const { testResult, testing } = useSupabaseConnectionTest(currentWorkspaceId || '');

  const handleWorkspaceChange = async (workspaceId: string) => {
    await setCurrentWorkspaceId(workspaceId);
  };

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
          {testing && (
            <p className="text-sm text-muted-foreground mt-2">Executando testes de conexão...</p>
          )}
        </div>
      </div>
    );
  }

  // Verificar se há dados para exibir
  const showNoDataWarning = testResult && !testResult.dataDisplayed;

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
        currentWorkspace={currentWorkspaceId}
        onWorkspaceChange={handleWorkspaceChange}
      />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* No Data Warning */}
        {showNoDataWarning && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-700 dark:text-yellow-400">
                Nenhum dado encontrado para este período
              </h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                Exibindo dados simulados. Verifique se há dados no banco de dados para o workspace{' '}
                <code className="bg-yellow-500/20 px-1 rounded text-xs">{currentWorkspaceId}</code>
              </p>
              {testResult && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-background/30 rounded p-2">
                    <p className="font-medium mb-1">Função kpi_totais_periodo:</p>
                    <p>Encontrada: {testResult.functionExists ? '✅ Sim' : '❌ Não'}</p>
                    <p>Tempo: {testResult.rpcTest.responseTime.toFixed(2)}ms</p>
                    <p>Linhas: {testResult.rpcTest.rowCount}</p>
                  </div>
                  <div className="bg-background/30 rounded p-2">
                    <p className="font-medium mb-1">View kpi_overview_daily:</p>
                    <p>Status: {testResult.viewTest.success ? '✅ OK' : '❌ Erro'}</p>
                    <p>Tempo: {testResult.viewTest.responseTime.toFixed(2)}ms</p>
                    <p>Linhas: {testResult.viewTest.rowCount}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
        <DataTable workspaceId={currentWorkspaceId || ''} />
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
