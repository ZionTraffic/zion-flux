import { Header } from "@/components/ui/Header";
import { useSupabaseDiagnostics } from "@/hooks/useSupabaseDiagnostics";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { NoWorkspaceAccess } from "@/components/workspace/NoWorkspaceAccess";
import { supabase } from "@/integrations/supabase/client";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { useExecutiveDashboard } from "@/hooks/useExecutiveDashboard";
import { useLeadsFromConversations } from "@/hooks/useLeadsFromConversations";
import { PeriodSummaryCard } from "@/components/dashboard/executive/PeriodSummaryCard";
import { MoneyKpiCard } from "@/components/dashboard/executive/MoneyKpiCard";
import { StrategicInsightsCard } from "@/components/dashboard/executive/StrategicInsightsCard";
import { CompleteFunnelChart } from "@/components/dashboard/executive/CompleteFunnelChart";
import { TopCampaignsTable } from "@/components/dashboard/executive/TopCampaignsTable";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { EnhancedKpiCard } from "@/components/dashboard/EnhancedKpiCard";
import { AtendimentosKpiCards } from "@/components/dashboard/AtendimentosKpiCards";
import { CSATAnalystTable } from "@/components/dashboard/CSATAnalystTablePremium";
import { useAtendimentosMetrics } from "@/hooks/useAtendimentosMetrics";
import { useCSATData } from "@/hooks/useCSATData";
import { pdf } from "@react-pdf/renderer";
import { DashboardPDF } from "@/components/reports/DashboardPDF";
import { format } from "date-fns";

const DashboardIndex = () => {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspace();
  const { currentDatabase } = useDatabase();
  const [workspaceDb, setWorkspaceDb] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const diagnostics = useSupabaseDiagnostics();
  const { toast } = useToast();

  // Date range state - default to last 90 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 90);
    return { from, to };
  });

  // Hook para métricas de atendimento (com filtro de data)
  const atendimentosMetrics = useAtendimentosMetrics(currentWorkspaceId, dateRange?.from, dateRange?.to);
  
  // Hook para dados de CSAT (com filtro de data)
  const csatData = useCSATData(currentWorkspaceId, dateRange?.from, dateRange?.to);
  
  // Debug: Log workspace info
  useEffect(() => {
    if (currentWorkspaceId && workspaceDb) {
      console.log('🏢 DEBUG Dashboard - Workspace atual:', {
        id: currentWorkspaceId,
        database: workspaceDb,
        name: workspaceName,
      });
    }
  }, [currentWorkspaceId, workspaceDb, workspaceName]);

  // Hook para dados de leads por stage (T1-T4)
  const leadsData = useLeadsFromConversations(
    currentWorkspaceId || '',
    dateRange?.from,
    dateRange?.to
  );

  const {
    businessHealth,
    qualificationMetrics,
    alerts,
    funnelData,
    topCampaigns,
    worstCampaign,
    isLoading,
    advancedMetrics,
    trafficLeadsChart,
    leadsSourceDistribution,
    roiHistory,
    metaAds,
    leads,
    conversations,
  } = useExecutiveDashboard(
    currentWorkspaceId || '',
    dateRange?.from,
    dateRange?.to
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email);
    });
  }, []);

  // Fetch workspace database to avoid showing Meta Ads for non-ASF workspaces
  useEffect(() => {
    if (!currentWorkspaceId) return;
    supabase
      .from('workspaces')
      .select('database, name')
      .eq('id', currentWorkspaceId)
      .maybeSingle()
      .then(({ data }) => {
        setWorkspaceDb(data?.database || null);
        setWorkspaceName(data?.name || null);
      });
  }, [currentWorkspaceId]);

  // 🔍 DEBUG roiHistory
  useEffect(() => {
    if (roiHistory && roiHistory.length > 0 && advancedMetrics) {
      console.log('📊 DEBUG DashboardIndex:', {
        roiHistoryLength: roiHistory.length,
        roiHistoryFirst: roiHistory[0],
        roiHistoryLast: roiHistory[roiHistory.length - 1],
        advancedMetrics,
      });
    }
  }, [roiHistory, advancedMetrics]);

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setLastUpdate(new Date());
      setTimeout(() => setIsRefreshing(false), 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleWorkspaceChange = async (workspaceId: string) => {
    await setCurrentWorkspaceId(workspaceId);
  };

  const handleClearFilter = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 90);
    setDateRange({ from, to });
    toast({
      title: "Filtro limpo",
      description: "Exibindo dados dos últimos 90 dias",
    });
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const blob = await pdf(
        <DashboardPDF
          businessHealth={businessHealth}
          qualificationMetrics={qualificationMetrics}
          alerts={alerts}
          funnelData={funnelData}
          topCampaigns={topCampaigns}
          advancedMetrics={advancedMetrics}
          trafficLeadsChart={trafficLeadsChart}
          leadsSourceDistribution={leadsSourceDistribution}
          metaAds={metaAds}
          dateRange={dateRange || { from: undefined, to: undefined }}
          workspaceName={workspaceName || 'Workspace'}
          workspaceSlug={workspaceDb}
          leads={leads}
          conversations={conversations}
          csatData={csatData.data}
          atendimentosMetrics={atendimentosMetrics}
          leadsDataByStage={leadsData.charts?.funnelData}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fromDate = dateRange?.from || new Date();
      const toDate = dateRange?.to || new Date();
      link.download = `dashboard-${currentWorkspaceId}-${format(fromDate, 'yyyy-MM-dd')}-${format(toDate, 'yyyy-MM-dd')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "✅ PDF gerado com sucesso!",
        description: "O arquivo foi baixado automaticamente.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "❌ Erro ao gerar PDF",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
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

  const componentKey = `${currentWorkspaceId}-${currentDatabase}`;

  return (
    <div className="min-h-screen" key={componentKey}>
      <Header
        onRefresh={() => window.location.reload()}
        isRefreshing={isLoading}
        lastUpdate={new Date()}
        currentWorkspace={currentWorkspaceId}
        onWorkspaceChange={handleWorkspaceChange}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
      />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        {!isLoading && (
          <HeroSection
            userName={userEmail}
            workspaceName={workspaceDb || 'Carregando...'}
            totalLeads={leads?.totalLeads || 0}
            totalInvested={advancedMetrics?.totalInvested || 0}
            conversionRate={leads?.qualificationRate || 0}
            trend="up"
            hideStats={workspaceDb === 'sieg'}
          />
        )}

        {/* Date Range Filter */}
        <div className="flex items-center justify-between gap-4">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onClearFilter={handleClearFilter}
            minDays={1}
            maxDays={90}
          />
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-border/50">
            <span className={`text-sm ${isRefreshing ? 'animate-pulse' : ''}`}>
              {isRefreshing ? '🔄' : '✅'}
            </span>
            <span className="text-sm text-muted-foreground">
              {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Enhanced KPIs with Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedKpiCard
            label="T1 - SEM RESPOSTA"
            value={(leadsData.charts?.funnelData?.find(f => f.id === 'novo_lead')?.value || 0).toLocaleString('pt-BR')}
            icon="🎯"
            variant="blue"
            delay={0}
          />

          <EnhancedKpiCard
            label="T2 - RESPONDIDO"
            value={(leadsData.charts?.funnelData?.find(f => f.id === 'qualificacao')?.value || 0).toLocaleString('pt-BR')}
            icon="💬"
            variant="blue"
            delay={0.1}
          />

          <EnhancedKpiCard
            label="T3 - PAGO IA"
            value={(leadsData.charts?.funnelData?.find(f => f.id === 'qualificados')?.value || 0).toLocaleString('pt-BR')}
            icon="💎"
            variant="gray"
            delay={0.2}
          />

          <EnhancedKpiCard
            label="T4 - TRANSFERIDO"
            value={(leadsData.charts?.funnelData?.find(f => f.id === 'followup')?.value || 0).toLocaleString('pt-BR')}
            icon="💰"
            variant="blue"
            delay={0.3}
          />
        </div>

        {/* Métricas de Atendimento - APENAS PARA SIEG */}
        {workspaceDb === 'sieg' && (
          <>
            <AtendimentosKpiCards
              atendimentosHoje={atendimentosMetrics.atendimentosHoje}
              atendimentosIA={atendimentosMetrics.atendimentosIA}
              percentualIA={atendimentosMetrics.percentualIA}
              atendimentosTransferidos={atendimentosMetrics.atendimentosTransferidos}
              isLoading={atendimentosMetrics.isLoading}
            />

            <CSATAnalystTable
              data={csatData.data}
              isLoading={csatData.isLoading}
              dateRange={dateRange}
            />
          </>
        )}

        {/* 3. Insights Estratégicos */}
        <StrategicInsightsCard alerts={alerts} />

        {/* 5. Gráficos Consolidados - Linha 1 - OCULTO PARA SIEG */}
        {workspaceDb !== 'sieg' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico 1: Resumo de Performance */}
          <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">📊</span>
              <h3 className="text-lg font-bold text-foreground">Resumo de Performance</h3>
            </div>
            <div className="space-y-6">
              {/* Métricas principais em cards 3D */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-xl p-4 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                     style={{ background: 'var(--gradient-blue)' }}>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Impressões
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {metaAds?.impressions?.toLocaleString('pt-BR') || '0'}
                  </div>
                </div>
                <div className="glass rounded-xl p-4 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                     style={{ background: 'var(--gradient-purple)' }}>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Total Leads
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {leads?.totalLeads || 0}
                  </div>
                </div>
              </div>

              {/* Barras de progresso 3D */}
              <div className="space-y-4">
                <div className="glass rounded-xl p-4 border border-border/50 shadow-md">
                  <div className="flex justify-between text-xs font-semibold mb-3">
                    <span className="text-muted-foreground uppercase tracking-wide">Taxa de Conversão</span>
                    <span className="text-foreground font-bold">{((leads?.totalLeads || 0) / (metaAds?.impressions || 1) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-4 bg-muted/30 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-500 shadow-lg"
                      style={{ 
                        width: `${Math.min(((leads?.totalLeads || 0) / (metaAds?.impressions || 1) * 100) * 100, 100)}%`,
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
                      }}
                    />
                  </div>
                </div>

                <div className="glass rounded-xl p-4 border border-border/50 shadow-md">
                  <div className="flex justify-between text-xs font-semibold mb-3">
                    <span className="text-muted-foreground uppercase tracking-wide">Conversas Iniciadas</span>
                    <span className="text-foreground font-bold">{metaAds?.conversas_iniciadas || 0}</span>
                  </div>
                  <div className="h-4 bg-muted/30 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-500 shadow-lg"
                      style={{ 
                        width: `${Math.min(((metaAds?.conversas_iniciadas || 0) / (leads?.totalLeads || 1)) * 100, 100)}%`,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                      }}
                    />
                  </div>
                </div>

                <div className="glass rounded-xl p-4 border border-border/50 shadow-md">
                  <div className="flex justify-between text-xs font-semibold mb-3">
                    <span className="text-muted-foreground uppercase tracking-wide">Leads Qualificados</span>
                    <span className="text-foreground font-bold">{leads?.qualifiedLeads || 0}</span>
                  </div>
                  <div className="h-4 bg-muted/30 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-500 shadow-lg"
                      style={{ 
                        width: `${Math.min(((leads?.qualifiedLeads || 0) / (leads?.totalLeads || 1)) * 100, 100)}%`,
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico 2: Distribuição por Fonte */}
          <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">📈</span>
              <h3 className="text-lg font-bold text-foreground">Leads por Fonte de Campanha</h3>
            </div>
            <div className="h-[400px] flex flex-col justify-center overflow-y-auto">
              {leadsSourceDistribution && leadsSourceDistribution.length > 0 ? (
                <div className="space-y-6 py-2">
                  {leadsSourceDistribution.slice(0, 5).map((item, idx) => {
                    const total = leadsSourceDistribution.reduce((sum, d) => sum + d.value, 0);
                    const percentage = total > 0 ? (item.value / total * 100) : 0;
                    const gradients = [
                      'linear-gradient(135deg, #3b82f6, #2563eb)',
                      'linear-gradient(135deg, #ec4899, #db2777)',
                      'linear-gradient(135deg, #f59e0b, #d97706)',
                      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      'linear-gradient(135deg, #10b981, #059669)'
                    ];
                    const shadows = [
                      '0 2px 8px rgba(59, 130, 246, 0.4)',
                      '0 2px 8px rgba(236, 72, 153, 0.4)',
                      '0 2px 8px rgba(245, 158, 11, 0.4)',
                      '0 2px 8px rgba(139, 92, 246, 0.4)',
                      '0 2px 8px rgba(16, 185, 129, 0.4)'
                    ];
                    
                    return (
                      <div key={idx} className="glass rounded-xl p-6 border-2 border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 bg-background/50 hover:scale-[1.02]">
                        {/* Nome da campanha */}
                        <div className="mb-4 pb-3 border-b-2 border-border/40">
                          <span className="text-sm font-extrabold text-foreground uppercase tracking-wider block leading-relaxed">
                            {item.name}
                          </span>
                        </div>
                        
                        {/* Valor e percentual */}
                        <div className="flex items-center justify-between mb-5">
                          <span className="text-2xl font-bold text-foreground">{item.value} <span className="text-base text-muted-foreground">leads</span></span>
                          <span className="text-3xl font-extrabold text-primary">{percentage.toFixed(1)}%</span>
                        </div>
                        
                        {/* Barra de progresso */}
                        <div className="w-full h-7 bg-muted/30 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full rounded-full transition-all duration-500 shadow-lg flex items-center justify-end pr-3"
                            style={{ 
                              width: `${percentage}%`,
                              background: gradients[idx % gradients.length],
                              boxShadow: shadows[idx % shadows.length]
                            }}
                          >
                            <span className="text-xs font-bold text-white drop-shadow-lg">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">Sem dados disponíveis</p>
              )}
            </div>
          </div>
        </div>
        )}

        {/* 7. Tabela de Campanhas - OCULTO PARA SIEG */}
        {workspaceDb !== 'sieg' && (
        <div className="glass rounded-2xl p-6 border border-border/50">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Resumo por Campanha</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3">Campanha</th>
                  <th className="text-right py-3 px-3">Impressões</th>
                  <th className="text-right py-3 px-3">Mensagens Iniciadas</th>
                  <th className="text-right py-3 px-3">CTR (%)</th>
                  <th className="text-right py-3 px-3">Custo por Conversa Iniciada</th>
                  <th className="text-right py-3 px-3">Investimento</th>
                </tr>
              </thead>
              <tbody>
                {metaAds.campaigns && metaAds.campaigns.length > 0 ? (
                  metaAds.campaigns.slice(0, 10).map((campaign: any, idx: number) => {
                    const totalClicks = metaAds.clicks || 1;
                    const totalConversas = metaAds.conversas_iniciadas || 1;
                    const estimatedConversas = Math.round((campaign.clicks / totalClicks) * totalConversas);
                    const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions * 100) : 0;
                    const custoConversa = estimatedConversas > 0 ? (campaign.spend / estimatedConversas) : 0;
                    
                    return (
                      <tr key={idx} className="border-b border-border/50 hover:bg-secondary/30 transition">
                        <td className="py-3 px-3 max-w-[200px] truncate">{campaign.campaign_name || campaign.name}</td>
                        <td className="text-right py-3 px-3">{(campaign.impressions || 0).toLocaleString('pt-BR')}</td>
                        <td className="text-right py-3 px-3 font-semibold" style={{ color: '#00d4ff' }}>
                          {estimatedConversas}
                        </td>
                        <td className="text-right py-3 px-3 font-semibold" style={{ color: '#10b981' }}>
                          {ctr.toFixed(2)}%
                        </td>
                        <td className="text-right py-3 px-3">
                          R$ {custoConversa.toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-3 font-semibold">
                          R$ {(campaign.spend || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma campanha disponível
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* 8. Top Campaigns - OCULTO PARA SIEG */}
        {workspaceDb !== 'sieg' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <TopCampaignsTable 
              campaigns={topCampaigns}
              worstCampaign={worstCampaign}
            />
          </div>
        </div>
        )}

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
