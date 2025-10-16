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
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const diagnostics = useSupabaseDiagnostics();
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
  } = useExecutiveDashboard(currentWorkspaceId || '');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email);
    });
  }, []);

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

        {/* 2. Última Atualização */}
        <div className="glass rounded-2xl p-4 border border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isRefreshing ? 'animate-pulse' : ''}`}>
              {isRefreshing ? '🔄' : '✅'}
            </span>
            <span className="text-sm text-muted-foreground">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Auto-refresh a cada 30s
          </span>
        </div>

        {/* 3. KPIs Principais - 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MoneyKpiCard
            label="Tráfego Total"
            value={(metaAds?.clicks || 0).toLocaleString('pt-BR')}
            icon="📊"
            trend={{ value: 12, isPositive: true }}
            variant="blue"
            delay={0}
          />
          <MoneyKpiCard
            label="Leads Gerados"
            value={(leads?.qualifiedLeads || 0).toLocaleString('pt-BR')}
            icon="🎯"
            trend={{ value: qualificationMetrics.qualifiedTrend, isPositive: true }}
            variant="emerald"
            delay={0.05}
          />
          <MoneyKpiCard
            label="Taxa de Conversão"
            value={`${(advancedMetrics?.qualificationRate || 0).toFixed(1)}%`}
            icon="💎"
            trend={{ value: 5, isPositive: true }}
            variant="purple"
            delay={0.1}
          />
          <MoneyKpiCard
            label="ROI / Lucro"
            value={`R$ ${(advancedMetrics?.profit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon="💰"
            trend={{ 
              value: Math.abs((advancedMetrics?.roi || 0) / 100), 
              isPositive: (advancedMetrics?.roi || 0) > 0 
            }}
            variant={(advancedMetrics?.roi || 0) > 0 ? "emerald" : "purple"}
            delay={0.15}
          />
        </div>

        {/* 4. Smart Alerts */}
        <SmartAlertsCard alerts={alerts} />

        {/* 5. Gráficos Consolidados - Linha 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico 1: Tráfego vs Leads */}
          <div className="glass rounded-2xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Tráfego vs Leads por Dia</h3>
            <div className="h-[300px]">
              {trafficLeadsChart && trafficLeadsChart.length > 0 ? (
                <div className="space-y-2">
                  {trafficLeadsChart.slice(-7).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground w-16">{item.date}</span>
                      <div className="flex-1 flex gap-2">
                        <div 
                          className="h-8 rounded-lg flex items-center justify-center text-xs font-semibold"
                          style={{ 
                            width: `${(item.traffic / Math.max(...trafficLeadsChart.map(d => d.traffic))) * 100}%`,
                            background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                            minWidth: '60px'
                          }}
                        >
                          {item.traffic}
                        </div>
                        <div 
                          className="h-8 rounded-lg flex items-center justify-center text-xs font-semibold"
                          style={{ 
                            width: `${(item.leads / Math.max(...trafficLeadsChart.map(d => d.leads))) * 100}%`,
                            background: 'linear-gradient(135deg, #ff1493, #cc1075)',
                            minWidth: '60px'
                          }}
                        >
                          {item.leads}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4 mt-4 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ background: '#00d4ff' }}></div>
                      <span className="text-xs">Tráfego</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ background: '#ff1493' }}></div>
                      <span className="text-xs">Leads</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center">Sem dados disponíveis</p>
              )}
            </div>
          </div>

          {/* Gráfico 2: Distribuição por Fonte */}
          <div className="glass rounded-2xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Leads por Fonte de Campanha</h3>
            <div className="h-[300px] flex flex-col justify-center">
              {leadsSourceDistribution && leadsSourceDistribution.length > 0 ? (
                <div className="space-y-3">
                  {leadsSourceDistribution.slice(0, 5).map((item, idx) => {
                    const total = leadsSourceDistribution.reduce((sum, d) => sum + d.value, 0);
                    const percentage = total > 0 ? (item.value / total * 100) : 0;
                    const colors = ['#00d4ff', '#ff1493', '#ffa500', '#a855f7', '#10b981'];
                    
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="truncate max-w-[200px]">{item.name}</span>
                          <span className="font-semibold">{item.value} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${percentage}%`,
                              background: colors[idx % colors.length]
                            }}
                          />
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

        {/* 6. Gráficos Consolidados - Linha 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico 3: ROI ao Longo do Tempo */}
          <div className="glass rounded-2xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold mb-4 text-foreground">ROI ao Longo do Tempo</h3>
            <div className="h-[300px] flex items-end gap-2 pb-8">
              {roiHistory && roiHistory.length > 0 ? (
                roiHistory.slice(-10).map((item, idx) => {
                  const maxROI = Math.max(...roiHistory.map(d => Math.abs(d.roi)));
                  const height = maxROI > 0 ? (Math.abs(item.roi) / maxROI * 100) : 0;
                  const isPositive = item.roi >= 0;
                  
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-xs font-semibold" style={{ color: isPositive ? '#10b981' : '#ef4444' }}>
                        {item.roi.toFixed(0)}%
                      </div>
                      <div 
                        className="w-full rounded-t-lg transition-all duration-500"
                        style={{ 
                          height: `${Math.max(height, 10)}%`,
                          background: isPositive 
                            ? 'linear-gradient(180deg, #10b981, #059669)' 
                            : 'linear-gradient(180deg, #ef4444, #dc2626)',
                          minHeight: '20px'
                        }}
                      />
                      <span className="text-xs text-muted-foreground rotate-45 origin-left mt-2">
                        {item.date}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center w-full">Sem dados disponíveis</p>
              )}
            </div>
          </div>

          {/* Gráfico 4: Funil de Vendas */}
          <div className="lg:col-span-1">
            <CompleteFunnelChart data={funnelData} />
          </div>
        </div>

        {/* 7. Tabela de Campanhas */}
        <div className="glass rounded-2xl p-6 border border-border/50">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Resumo por Campanha</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3">Campanha</th>
                  <th className="text-right py-3 px-3">Impressões</th>
                  <th className="text-right py-3 px-3">Cliques</th>
                  <th className="text-right py-3 px-3">CTR (%)</th>
                  <th className="text-right py-3 px-3">CPC (R$)</th>
                  <th className="text-right py-3 px-3">Investimento</th>
                  <th className="text-right py-3 px-3">Leads Est.</th>
                </tr>
              </thead>
              <tbody>
                {metaAds.campaigns && metaAds.campaigns.length > 0 ? (
                  metaAds.campaigns.slice(0, 10).map((campaign: any, idx: number) => {
                    const totalClicks = metaAds.clicks || 1;
                    const totalLeads = leads?.totalLeads || 0;
                    const estimatedLeads = Math.round((campaign.clicks / totalClicks) * totalLeads);
                    const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions * 100) : 0;
                    
                    return (
                      <tr key={idx} className="border-b border-border/50 hover:bg-secondary/30 transition">
                        <td className="py-3 px-3 max-w-[200px] truncate">{campaign.campaign_name || campaign.name}</td>
                        <td className="text-right py-3 px-3">{(campaign.impressions || 0).toLocaleString('pt-BR')}</td>
                        <td className="text-right py-3 px-3">{(campaign.clicks || 0).toLocaleString('pt-BR')}</td>
                        <td className="text-right py-3 px-3 font-semibold" style={{ color: '#00d4ff' }}>
                          {ctr.toFixed(2)}%
                        </td>
                        <td className="text-right py-3 px-3">R$ {(campaign.cpc || 0).toFixed(2)}</td>
                        <td className="text-right py-3 px-3 font-semibold">
                          R$ {(campaign.spend || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-right py-3 px-3 font-semibold" style={{ color: '#ff1493' }}>
                          {estimatedLeads}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma campanha disponível
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 8. Top Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
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
