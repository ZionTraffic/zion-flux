import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { PremiumKpiCard } from "@/components/dashboard/cards/PremiumKpiCard";
import { BarChart } from "@/components/dashboard/charts/BarChart";
import { DonutChart } from "@/components/dashboard/charts/DonutChart";
import { LineChart } from "@/components/dashboard/charts/LineChart";
import { FunnelChart } from "@/components/dashboard/charts/FunnelChart";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { useSupabaseDiagnostics } from "@/hooks/useSupabaseDiagnostics";
import { useSupabaseConnectionTest } from "@/hooks/useSupabaseConnectionTest";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { NoWorkspaceAccess } from "@/components/workspace/NoWorkspaceAccess";
import { supabase } from "@/integrations/supabase/client";

const DashboardIndex = () => {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspace();
  const [userEmail, setUserEmail] = useState<string>();
  const diagnostics = useSupabaseDiagnostics();
  const { totals, daily, loading, lastUpdate, refetch } = useAnalyticsData(currentWorkspaceId || '');
  const { testResult, testing } = useSupabaseConnectionTest(currentWorkspaceId || '');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email);
    });
  }, []);

  const handleWorkspaceChange = async (workspaceId: string) => {
    await setCurrentWorkspaceId(workspaceId);
  };

  // Show no workspace screen if user has no workspace access
  if (!currentWorkspaceId && diagnostics.status !== "checking") {
    return <NoWorkspaceAccess userEmail={userEmail} />;
  }

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
            <Button onClick={() => window.location.reload()} variant="default" className="mt-4">
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

  // Verificar se há dados para exibir
  const showNoDataWarning = testResult && !testResult.dataDisplayed;

  // KPI Cards Data
  const kpiCards = [
    {
      id: 'leads',
      label: 'Leads Recebidos',
      value: totals.leads_recebidos.toLocaleString('pt-BR'),
      icon: '⚡',
      variant: 'emerald' as const,
      trend: { value: 12.5, isPositive: true },
      delay: 0,
    },
    {
      id: 'qualified',
      label: 'Qualificados',
      value: totals.leads_qualificados.toLocaleString('pt-BR'),
      icon: '✓',
      variant: 'blue' as const,
      trend: { value: 8.3, isPositive: true },
      delay: 0.1,
    },
    {
      id: 'followup',
      label: 'Follow-up',
      value: totals.leads_followup.toLocaleString('pt-BR'),
      icon: '↻',
      variant: 'amber' as const,
      trend: { value: 5.1, isPositive: false },
      delay: 0.2,
    },
    {
      id: 'discarded',
      label: 'Descartados',
      value: totals.leads_descartados.toLocaleString('pt-BR'),
      icon: '✕',
      variant: 'gray' as const,
      trend: { value: 2.8, isPositive: false },
      delay: 0.3,
    },
  ];

  // Chart Data
  const barChartData = daily.map((d) => ({
    day: new Date(d.day).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    value: d.leads_recebidos,
  }));

  const donutChartData = [
    { name: 'Qualificados', value: totals.leads_qualificados },
    { name: 'Follow-up', value: totals.leads_followup },
    { name: 'Descartados', value: totals.leads_descartados },
  ];

  const lineChartData = daily.map((d) => ({
    day: new Date(d.day).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    value: d.leads_qualificados,
  }));

  const funnelData = [
    { name: 'Visitas', value: totals.leads_recebidos },
    { name: 'Leads', value: totals.leads_qualificados },
    { name: 'Conversões', value: Math.floor(totals.leads_qualificados * 0.3) },
  ];

  return (
    <DashboardLayout
      onRefresh={refetch}
      isRefreshing={loading}
      lastUpdate={lastUpdate}
      currentWorkspace={currentWorkspaceId}
      onWorkspaceChange={handleWorkspaceChange}
    >
      {/* No Data Warning */}
      {showNoDataWarning && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-700 dark:text-yellow-400">
              Nenhum dado encontrado para este período
            </h3>
            <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
              Exibindo dados simulados.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card) => (
          <PremiumKpiCard
            key={card.id}
            label={card.label}
            value={card.value}
            icon={card.icon}
            variant={card.variant}
            trend={card.trend}
            delay={card.delay}
          />
        ))}
      </div>

      {/* Charts Grid - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
          <BarChart data={barChartData} title="Leads Recebidos (Últimos Dias)" />
        </div>
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
          <DonutChart data={donutChartData} title="Distribuição de Leads" />
        </div>
      </div>

      {/* Charts Grid - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
          <LineChart data={lineChartData} title="Evolução de Qualificados" />
        </div>
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
          <FunnelChart data={funnelData} title="Funil de Conversão" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardIndex;
