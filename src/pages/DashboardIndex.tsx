import { Header } from "@/components/ui/Header";
import { useSupabaseDiagnostics } from "@/hooks/useSupabaseDiagnostics";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { NoWorkspaceAccess } from "@/components/workspace/NoWorkspaceAccess";
import { supabase } from "@/integrations/supabase/client";
import { useExecutiveDashboard } from "@/hooks/useExecutiveDashboard";
import { BusinessHealthCard } from "@/components/dashboard/executive/BusinessHealthCard";
import { MoneyKpiCard } from "@/components/dashboard/executive/MoneyKpiCard";
import { SmartAlertsCard } from "@/components/dashboard/executive/SmartAlertsCard";
import { CompleteFunnelChart } from "@/components/dashboard/executive/CompleteFunnelChart";
import { TopCampaignsTable } from "@/components/dashboard/executive/TopCampaignsTable";
import { ActionCard } from "@/components/dashboard/executive/ActionCard";

const DashboardIndex = () => {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspace();
  const [userEmail, setUserEmail] = useState<string>();
  const diagnostics = useSupabaseDiagnostics();
  const {
    businessHealth,
    qualificationMetrics,
    alerts,
    funnelData,
    topCampaigns,
    worstCampaign,
    isLoading,
    metaAds,
    leads,
    conversations,
  } = useExecutiveDashboard(currentWorkspaceId || '');

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
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-muted-foreground">Carregando dashboard executivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        onRefresh={() => window.location.reload()}
        isRefreshing={isLoading}
        lastUpdate={new Date()}
        currentWorkspace={currentWorkspaceId}
        onWorkspaceChange={handleWorkspaceChange}
      />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* 1. Business Health - Hero Section */}
        <BusinessHealthCard 
          health={businessHealth}
          metrics={qualificationMetrics}
        />

        {/* 2. Qualification Metrics - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MoneyKpiCard
            label="Investido"
            value={`R$ ${qualificationMetrics.invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon="💰"
            trend={{ value: qualificationMetrics.investedTrend, isPositive: true }}
            variant="blue"
            delay={0}
          />
          <MoneyKpiCard
            label="Leads Qualificados"
            value={qualificationMetrics.qualifiedLeads.toLocaleString('pt-BR')}
            icon="🎯"
            trend={{ value: qualificationMetrics.qualifiedTrend, isPositive: true }}
            variant="emerald"
            delay={0.05}
          />
          <MoneyKpiCard
            label="CPL (Custo por Lead)"
            value={`R$ ${qualificationMetrics.cpl.toFixed(2)}`}
            icon="💵"
            trend={{ value: Math.abs(qualificationMetrics.cplTrend), isPositive: qualificationMetrics.cplTrend < 0 }}
            variant="purple"
            delay={0.1}
          />
        </div>

        {/* 3. Smart Alerts */}
        <SmartAlertsCard alerts={alerts} />

        {/* 4. Main Content - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2">
            <CompleteFunnelChart data={funnelData} />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <TopCampaignsTable 
              campaigns={topCampaigns}
              worstCampaign={worstCampaign}
            />
          </div>
        </div>

        {/* 5. Action Cards - Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="Tráfego"
            icon="📊"
            metrics={[
              { label: 'Investimento', value: `R$ ${(metaAds?.spend || 0).toLocaleString('pt-BR')}` },
              { label: 'Conversas', value: (metaAds?.conversas_iniciadas || 0).toLocaleString('pt-BR') },
              { label: 'CPC', value: `R$ ${(metaAds?.cpc || 0).toFixed(2)}` },
            ]}
            alert={metaAds && metaAds.cpc > 5 ? 'CPC Alto' : undefined}
            linkTo="/trafego"
            variant="trafego"
            delay={0}
          />
          <ActionCard
            title="Qualificação"
            icon="🎯"
            metrics={[
              { label: 'Total de Leads', value: (leads?.totalLeads || 0).toLocaleString('pt-BR') },
              { label: 'Qualificados', value: (leads?.qualifiedLeads || 0).toLocaleString('pt-BR') },
              { label: 'Taxa', value: `${(leads?.qualificationRate || 0).toFixed(1)}%` },
            ]}
            alert={leads && leads.qualificationRate < 25 ? 'Taxa Baixa' : undefined}
            linkTo="/qualificacao"
            variant="qualificacao"
            delay={0.05}
          />
          <ActionCard
            title="Conversas"
            icon="💬"
            metrics={[
              { label: 'Total', value: (conversations?.totalConversations || 0).toLocaleString('pt-BR') },
              { label: 'Taxa Conversão', value: `${(conversations?.conversionRate || 0).toFixed(1)}%` },
              { label: 'Tempo Médio', value: `${Math.round((conversations?.averageDuration || 0) / 60)}min` },
            ]}
            alert={conversations && conversations.conversionRate < 20 ? 'Conv. Baixa' : undefined}
            linkTo="/analise"
            variant="analise"
            delay={0.1}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-6 mt-12">
        <div className="glass rounded-2xl p-6 text-center border border-border/50">
          <p className="text-sm text-muted-foreground">
            Zion App &copy; 2025 - Dashboard Executivo
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardIndex;
