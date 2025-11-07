import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { PremiumKpiCard } from "@/components/dashboard/cards/PremiumKpiCard";
import { BarChart } from "@/components/dashboard/charts/BarChart";
import { DonutChart } from "@/components/dashboard/charts/DonutChart";
import { LineChart } from "@/components/dashboard/charts/LineChart";
import { FunnelPremium } from "@/components/dashboard/charts/FunnelPremium";
import { useMetaAdsData } from "@/hooks/useMetaAdsData";
import { useSupabaseConnectionTest } from "@/hooks/useSupabaseConnectionTest";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { pdf } from "@react-pdf/renderer";
import { TrafegoPDF } from "@/components/reports/TrafegoPDF";
import { format } from "date-fns";
import { useTenant } from "@/contexts/TenantContext";
import { TenantSelector } from "@/components/ui/TenantSelector";

const Trafego = () => {
  const { currentTenant } = useTenant();
  const [userEmail, setUserEmail] = useState<string>();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  
  // Date range state - default to last 90 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 90);
    return { from, to };
  });

  const { totals, daily, campaigns, loading, error, lastUpdate, refetch } = useMetaAdsData(
    currentTenant?.id || '',
    dateRange?.from,
    dateRange?.to
  );
  const { testResult, testing } = useSupabaseConnectionTest(currentTenant?.id || '');

  useEffect(() => {
    console.log('🌐 Tráfego - tenant atual', currentTenant);
  }, [currentTenant]);

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Dados atualizados",
      description: "As métricas foram atualizadas com sucesso",
    });
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

  const applyQuickFilter = (type: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth') => {
    const to = new Date();
    const from = new Date();
    
    switch(type) {
      case 'today':
        // from e to são o mesmo dia (hoje)
        break;
      case 'yesterday':
        from.setDate(to.getDate() - 1);
        to.setDate(to.getDate() - 1);
        break;
      case 'last7days':
        from.setDate(to.getDate() - 7);
        break;
      case 'last30days':
        from.setDate(to.getDate() - 30);
        break;
      case 'thisMonth':
        from.setDate(1); // Primeiro dia do mês atual
        break;
      case 'lastMonth':
        from.setMonth(to.getMonth() - 1);
        from.setDate(1);
        to.setMonth(to.getMonth() - 1);
        to.setDate(new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate());
        break;
    }
    
    // Aplicar o filtro ao estado
    setDateRange({ from, to });
    toast({
      title: "Filtro aplicado",
      description: `Exibindo dados do período selecionado`,
    });
  };

  const isActiveFilter = (type: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth') => {
    if (!dateRange?.from || !dateRange?.to) return false;
    
    const today = new Date();
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
    
    switch(type) {
      case 'today': {
        return isSameDay(dateRange.from, today) && isSameDay(dateRange.to, today);
      }
      case 'yesterday': {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        return isSameDay(dateRange.from, yesterday) && isSameDay(dateRange.to, yesterday);
      }
      case 'last7days': {
        const from = new Date();
        from.setDate(today.getDate() - 7);
        return isSameDay(dateRange.from, from) && isSameDay(dateRange.to, today);
      }
      case 'last30days': {
        const from = new Date();
        from.setDate(today.getDate() - 30);
        return isSameDay(dateRange.from, from) && isSameDay(dateRange.to, today);
      }
      case 'thisMonth': {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        return isSameDay(dateRange.from, firstDay) && isSameDay(dateRange.to, today);
      }
      case 'lastMonth': {
        const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
        return isSameDay(dateRange.from, firstDay) && isSameDay(dateRange.to, lastDay);
      }
    }
  };

  const handleExportPdf = async () => {
    if (!totals) return;
    
    setIsExporting(true);
    try {
      const blob = await pdf(
        <TrafegoPDF
          totals={totals}
          daily={daily}
          campaigns={campaigns}
          dateRange={dateRange}
          workspaceName={currentTenant?.name || currentTenant?.slug || 'Empresa'}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = dateRange?.from && dateRange?.to 
        ? `${format(dateRange.from, 'yyyy-MM-dd')}-${format(dateRange.to, 'yyyy-MM-dd')}`
        : format(new Date(), 'yyyy-MM-dd');
      link.download = `trafego-${currentTenant?.slug || 'tenant'}-${dateStr}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "✅ Relatório de Tráfego exportado!",
        description: "PDF gerado com sucesso.",
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
  if (!currentTenant) {
    return (
      <DashboardLayout
        onRefresh={refetch}
        isRefreshing={false}
        lastUpdate={new Date()}
        currentWorkspace={null}
        onWorkspaceChange={async () => {}}
        onExportPdf={() => {}}
        isExporting={false}
      >
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="glass rounded-2xl p-8 border border-border/50 max-w-lg w-full text-center">
            <div className="text-4xl mb-3">🏢</div>
            <h2 className="text-xl font-semibold mb-2">Selecione uma empresa</h2>
            <p className="text-sm text-muted-foreground">
              Escolha um tenant para visualizar os dados de tráfego.
            </p>
            <div className="mt-4 flex justify-center">
              <TenantSelector />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Diagnóstico em andamento
  if (false) {}

  // Diagnóstico falhou
  if (false) {}

  // Carregando dados do dashboard
  if (loading || !totals) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-muted-foreground">Carregando métricas do Meta Ads...</p>
        </div>
      </div>
    );
  }

  // Helper function to calculate trend
  const calculateTrend = (
    dailyData: typeof daily,
    metric: keyof typeof daily[0],
    higherIsBetter: boolean = true
  ): { value: number; isPositive: boolean } => {
    if (dailyData.length < 2) return { value: 0, isPositive: true };

    const midPoint = Math.floor(dailyData.length / 2);
    const firstHalf = dailyData.slice(0, midPoint);
    const secondHalf = dailyData.slice(midPoint);

    const avgFirst = firstHalf.reduce((sum, d) => sum + Number(d[metric]), 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, d) => sum + Number(d[metric]), 0) / secondHalf.length;

    const percentChange = avgFirst === 0 ? 0 : ((avgSecond - avgFirst) / avgFirst) * 100;
    const isPositive = higherIsBetter ? percentChange > 0 : percentChange < 0;

    return {
      value: Math.abs(percentChange),
      isPositive,
    };
  };

  // Helper function to calculate trend for custom metrics (calculated from daily data)
  const calculateCustomTrend = (
    dailyData: typeof daily,
    calculateValue: (d: typeof daily[0]) => number,
    higherIsBetter: boolean = false
  ): { value: number; isPositive: boolean } => {
    if (dailyData.length < 2) return { value: 0, isPositive: true };

    const values = dailyData.map(calculateValue);
    const midPoint = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, midPoint);
    const secondHalf = values.slice(midPoint);

    const avgFirst = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

    const percentChange = avgFirst === 0 ? 0 : ((avgSecond - avgFirst) / avgFirst) * 100;
    const isPositive = higherIsBetter ? percentChange > 0 : percentChange < 0;

    return {
      value: Math.abs(percentChange),
      isPositive,
    };
  };

  // KPI Cards Data - Real Meta Ads data
  const kpiCards = [
    {
      id: 'impressoes',
      label: 'Impressões',
      value: totals?.impressions.toLocaleString('pt-BR') || '0',
      icon: '👁️',
      variant: 'blue' as const,
      trend: totals ? calculateTrend(daily, 'impressions') : { value: 0, isPositive: true },
      delay: 0,
    },
    {
      id: 'investimento',
      label: 'Investimento',
      value: `R$ ${totals?.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`,
      icon: '💰',
      variant: 'blue' as const,
      trend: totals ? calculateTrend(daily, 'spend') : { value: 0, isPositive: true },
      delay: 0.1,
    },
    {
      id: 'cpc',
      label: 'CPC Médio',
      value: `R$ ${totals?.cpc.toFixed(2) || '0,00'}`,
      icon: '📊',
      variant: 'gray' as const,
      trend: totals ? calculateTrend(daily, 'cpc', false) : { value: 0, isPositive: true },
      delay: 0.2,
    },
    {
      id: 'cpc_conversa',
      label: 'Custo por Conversa',
      value: (() => {
        const cpcConversa = totals?.conversas_iniciadas > 0 
          ? totals.spend / totals.conversas_iniciadas 
          : 0;
        return `R$ ${cpcConversa.toFixed(2)}`;
      })(),
      icon: '💬💰',
      variant: 'blue' as const,
      trend: totals 
        ? calculateCustomTrend(
            daily, 
            (d) => d.conversas_iniciadas > 0 ? d.spend / d.conversas_iniciadas : 0,
            false
          ) 
        : { value: 0, isPositive: true },
      delay: 0.3,
    },
    {
      id: 'ctr',
      label: 'CTR Médio',
      value: `${totals?.ctr.toFixed(2) || '0,00'}%`,
      icon: '🎯',
      variant: 'gray' as const,
      trend: totals ? calculateTrend(daily, 'ctr') : { value: 0, isPositive: true },
      delay: 0.4,
    },
    {
      id: 'conversas_iniciadas',
      label: 'Conversas Iniciadas',
      value: totals?.conversas_iniciadas.toLocaleString('pt-BR') || '0',
      icon: '💬',
      variant: 'blue' as const,
      trend: totals ? calculateTrend(daily, 'conversas_iniciadas') : { value: 0, isPositive: true },
      delay: 0.5,
    },
  ];

  // Chart Data - Real Meta Ads data
  console.log('📊 Daily data count:', daily.length);
  console.log('📊 First 3 daily records:', daily.slice(0, 3));
  
  const barChartData = daily.map((d) => ({
    day: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    value: d.impressions,
  }));
  
  console.log('📊 Bar chart data count:', barChartData.length);
  console.log('📊 First 3 bar chart items:', barChartData.slice(0, 3));

  // Agregar investimento por estágio de funil
  const spendByFunnel = campaigns.reduce((acc, campaign) => {
    acc[campaign.funnelStage] = (acc[campaign.funnelStage] || 0) + campaign.spend;
    return acc;
  }, {} as Record<string, number>);

  const donutChartData = [
    {
      name: 'Topo de Funil',
      value: spendByFunnel.topo || 0,
      color: '#00c6ff',
    },
    {
      name: 'Meio de Funil',
      value: spendByFunnel.meio || 0,
      color: '#10b981',
    },
    {
      name: 'Fundo de Funil',
      value: spendByFunnel.fundo || 0,
      color: '#a855f7',
    },
  ].filter(item => item.value > 0);

  // Filtrar dados pelo intervalo de datas selecionado
  const filteredDaily = daily.filter(d => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const from = dateRange.from.toISOString().split('T')[0];
    const to = dateRange.to.toISOString().split('T')[0];
    return d.date >= from && d.date <= to;
  });

  // Corrigir formatação de data para evitar erro de timezone
  // Gerar dados do gráfico de "Evolução de Conversas Iniciadas"
  // Corrigido para evitar recuo de data por timezone (UTC → -3)
  const lineChartData = filteredDaily
    .filter(d => d.conversas_iniciadas > 0) // <— exibe só dias com conversas reais
    .map(d => {
      // Quebra a data "YYYY-MM-DD" sem converter para UTC
      const [year, month, day] = d.date.split('-');

      // Converte o mês numérico em texto curto em português
      const monthNames = [
        'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
        'jul', 'ago', 'set', 'out', 'nov', 'dez'
      ];

      // Formata a data preservando o dia real da API
      const label = `${day} de ${monthNames[parseInt(month, 10) - 1]}`;

      return {
        day: label, // mantém o dia real, sem recuo de fuso
        value: d.conversas_iniciadas
      };
    });

  // Expor globalmente para inspeção
  (window as any).__lineChartDebug = lineChartData;
  console.log('💡 Para inspecionar no console: __lineChartDebug');
  console.log('📈 LINE CHART DATA CORRIGIDO:', lineChartData.slice(0, 5));
  console.log(`✅ Último ponto visível: ${lineChartData[lineChartData.length - 1]?.day}`);
  console.log('📊 Total conversas no período:', totals?.conversas_iniciadas);

  const funnelData = [
    { name: 'Impressões', value: totals?.impressions || 0 },
    { name: 'Cliques', value: totals?.clicks || 0 },
    { name: 'Conversas Iniciadas', value: totals?.conversas_iniciadas || 0 },
  ];

  const componentKey = `${currentTenant?.id || 'no-tenant'}`;

  return (
      <DashboardLayout key={componentKey}
      onRefresh={refetch}
      isRefreshing={loading}
      lastUpdate={lastUpdate}
      currentWorkspace={currentTenant?.id || null}
      onWorkspaceChange={async () => {}}
      onExportPdf={handleExportPdf}
      isExporting={isExporting}
    >
      <div className="flex justify-end mb-4">
        <TenantSelector />
      </div>
      {/* Date Range Filter */}
      <div className="mb-6">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onClearFilter={handleClearFilter}
          minDays={1}
          maxDays={90}
        />
      </div>

      {/* Error Messages */}
      {error === 'TOKEN_EXPIRED' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">🔑</span>
          <div className="flex-1">
            <h3 className="font-semibold text-red-700 dark:text-red-400">
              Token do Meta Ads expirado
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
              Seu token de acesso expirou. Renove a conexão com o Meta Business.
            </p>
            <Button
              onClick={() => window.open('https://business.facebook.com', '_blank')}
              variant="destructive"
              size="sm"
              className="mt-3"
            >
              🔄 Renovar Conexão
            </Button>
          </div>
        </div>
      )}

      {error === 'CREDENTIALS_MISSING' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">⚙️</span>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-700 dark:text-yellow-400">
              Credenciais não configuradas
            </h3>
            <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
              Configure as credenciais do Meta Ads no sistema para ver os dados.
            </p>
          </div>
        </div>
      )}

      {!error && totals && totals.impressions === 0 && !loading && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">📊</span>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-700 dark:text-blue-400">
              Nenhuma campanha ativa
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              Não há dados de campanhas nos últimos 30 dias para esta conta.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
          <BarChart data={barChartData} title="Impressões (Últimos Dias)" valueType="number" />
        </div>
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
          <DonutChart data={donutChartData} title="Investimento por Campanha" />
        </div>
      </div>

      {/* Charts Grid - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
          <LineChart data={lineChartData} title="Evolução de Conversas Iniciadas" />
        </div>
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
          <FunnelPremium
            stages={[
              { id: 'impressions', label: 'Impressões', value: totals?.impressions || 0 },
              { id: 'clicks', label: 'Cliques', value: totals?.clicks || 0 },
              { id: 'conversations', label: 'Conversas Iniciadas', value: totals?.conversas_iniciadas || 0 },
            ]}
            coinsCount={16}
            showCoins={true}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Trafego;
