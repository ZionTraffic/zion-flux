import { Header } from "@/components/ui/Header";
import { KpiCard } from "@/components/ui/KpiCard";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import { DataTable } from "@/components/tables/DataTable";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { useState } from "react";

const Index = () => {
  const [workspaceId, setWorkspaceId] = useState("3f14bb25-0eda-4c58-8486-16b96dca6f9e");
  const { totals, daily, loading, lastUpdate, refetch } = useAnalyticsData(workspaceId);

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
