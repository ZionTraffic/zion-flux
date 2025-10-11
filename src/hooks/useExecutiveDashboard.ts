import { useMemo } from 'react';
import { useMetaAdsData } from './useMetaAdsData';
import { useLeadsFromConversations } from './useLeadsFromConversations';
import { useConversationsData } from './useConversationsData';

export interface BusinessHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'opportunity';
  title: string;
  description: string;
  action?: string;
}

export interface MoneyMetrics {
  invested: number;
  estimatedReturn: number;
  roi: number;
  investedTrend: number;
  returnTrend: number;
  roiTrend: number;
}

export interface FunnelStage {
  name: string;
  value: number;
  conversionRate?: number;
  benchmark?: number;
  isBottleneck?: boolean;
}

export function useExecutiveDashboard(
  workspaceId: string,
  startDate?: Date,
  endDate?: Date,
  days: number = 30
) {
  const metaAds = useMetaAdsData(workspaceId, startDate, endDate, days);
  const leads = useLeadsFromConversations(workspaceId, startDate, endDate);
  const conversations = useConversationsData(workspaceId);

  // Ticket médio estimado - pode ser configurável no futuro
  const TICKET_MEDIO = 800; // R$ 800 por lead qualificado

  // Calcular métricas de dinheiro
  const moneyMetrics: MoneyMetrics = useMemo(() => {
    const invested = metaAds.totals?.spend || 0;
    const estimatedReturn = (leads.kpis?.qualifiedLeads || 0) * TICKET_MEDIO;
    const roi = invested > 0 ? ((estimatedReturn - invested) / invested) * 100 : 0;

    return {
      invested,
      estimatedReturn,
      roi,
      investedTrend: 15, // Mock - calcular com dados históricos
      returnTrend: 23,
      roiTrend: 8,
    };
  }, [metaAds.totals, leads.kpis]);

  // Determinar saúde do negócio
  const businessHealth: BusinessHealth = useMemo(() => {
    const roi = moneyMetrics.roi;
    const qualificationRate = leads.kpis?.qualificationRate || 0;

    if (roi > 200 && qualificationRate > 30) {
      return { status: 'healthy', score: 95 };
    } else if (roi > 100 && qualificationRate > 15) {
      return { status: 'warning', score: 65 };
    } else {
      return { status: 'critical', score: 30 };
    }
  }, [moneyMetrics.roi, leads.kpis]);

  // Gerar alertas inteligentes
  const alerts: Alert[] = useMemo(() => {
    const alertsList: Alert[] = [];

    // Alerta de CPL alto
    const custoConversa = metaAds.totals?.conversas_iniciadas 
      ? metaAds.totals.spend / metaAds.totals.conversas_iniciadas 
      : 0;
    
    if (custoConversa > 10) {
      alertsList.push({
        id: 'high-cpc',
        type: 'critical',
        title: 'Custo por conversa elevado',
        description: `R$ ${custoConversa.toFixed(2)} por conversa. Campanhas podem estar com CPC alto.`,
        action: 'Otimizar Campanhas',
      });
    }

    // Alerta de qualificação baixa
    const qualificationRate = leads.kpis?.qualificationRate || 0;
    if (qualificationRate < 25) {
      alertsList.push({
        id: 'low-qualification',
        type: 'warning',
        title: 'Taxa de qualificação abaixo da meta',
        description: `${qualificationRate.toFixed(1)}% de qualificação (meta: 25%). Leads podem não estar sendo bem trabalhados.`,
        action: 'Qualificar Leads',
      });
    }

    // Oportunidade - ROI alto
    if (moneyMetrics.roi > 300) {
      alertsList.push({
        id: 'high-roi',
        type: 'opportunity',
        title: 'ROI excepcional detectado',
        description: `ROI de ${moneyMetrics.roi.toFixed(0)}%. Considere aumentar investimento.`,
        action: 'Escalar Investimento',
      });
    }

    // Alerta de conversas com baixa conversão
    const conversionRate = conversations.stats?.conversionRate || 0;
    if (conversionRate < 20) {
      alertsList.push({
        id: 'low-conversion',
        type: 'warning',
        title: 'Taxa de conversão baixa',
        description: `${conversionRate.toFixed(1)}% das conversas converteram. Analise qualidade do atendimento.`,
        action: 'Analisar Conversas',
      });
    }

    return alertsList.slice(0, 4); // Limitar a 4 alertas
  }, [metaAds.totals, leads.kpis, conversations.stats, moneyMetrics.roi]);

  // Dados do funil completo
  const funnelData: FunnelStage[] = useMemo(() => {
    const impressions = metaAds.totals?.impressions || 0;
    const clicks = metaAds.totals?.clicks || 0;
    const conversas = metaAds.totals?.conversas_iniciadas || 0;
    const totalLeads = leads.kpis?.totalLeads || 0;
    const qualifiedLeads = leads.kpis?.qualifiedLeads || 0;
    const estimatedSales = Math.round(qualifiedLeads * 0.15); // 15% conversão estimada

    return [
      {
        name: 'Impressões',
        value: impressions,
        conversionRate: impressions > 0 ? (clicks / impressions) * 100 : 0,
        benchmark: 2.5,
      },
      {
        name: 'Cliques',
        value: clicks,
        conversionRate: clicks > 0 ? (conversas / clicks) * 100 : 0,
        benchmark: 60,
        isBottleneck: clicks > 0 && (conversas / clicks) * 100 < 45,
      },
      {
        name: 'Conversas',
        value: conversas,
        conversionRate: conversas > 0 ? (totalLeads / conversas) * 100 : 0,
        benchmark: 70,
      },
      {
        name: 'Leads',
        value: totalLeads,
        conversionRate: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0,
        benchmark: 30,
        isBottleneck: totalLeads > 0 && (qualifiedLeads / totalLeads) * 100 < 20,
      },
      {
        name: 'Qualificados',
        value: qualifiedLeads,
        conversionRate: 15, // Estimado
        benchmark: 15,
      },
      {
        name: 'Vendas',
        value: estimatedSales,
      },
    ];
  }, [metaAds.totals, leads.kpis]);

  // Top campanhas - usando estimativa baseada em clicks
  const topCampaigns = useMemo(() => {
    const conversasEstimadas = metaAds.totals?.conversas_iniciadas || 0;
    const clicksTotal = metaAds.totals?.clicks || 1;
    const conversaoRate = clicksTotal > 0 ? conversasEstimadas / clicksTotal : 0.5;

    return (metaAds.campaigns || [])
      .map(campaign => {
        const estimatedConversas = campaign.clicks * conversaoRate;
        return {
          ...campaign,
          roi: campaign.spend > 0 
            ? ((estimatedConversas * TICKET_MEDIO * 0.25 - campaign.spend) / campaign.spend) * 100 
            : 0,
        };
      })
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 3);
  }, [metaAds.campaigns, metaAds.totals]);

  const worstCampaign = useMemo(() => {
    const conversasEstimadas = metaAds.totals?.conversas_iniciadas || 0;
    const clicksTotal = metaAds.totals?.clicks || 1;
    const conversaoRate = clicksTotal > 0 ? conversasEstimadas / clicksTotal : 0.5;

    return (metaAds.campaigns || [])
      .map(campaign => {
        const estimatedConversas = campaign.clicks * conversaoRate;
        return {
          ...campaign,
          roi: campaign.spend > 0 
            ? ((estimatedConversas * TICKET_MEDIO * 0.25 - campaign.spend) / campaign.spend) * 100 
            : 0,
        };
      })
      .sort((a, b) => a.roi - b.roi)[0];
  }, [metaAds.campaigns, metaAds.totals]);

  return {
    businessHealth,
    moneyMetrics,
    alerts,
    funnelData,
    topCampaigns,
    worstCampaign,
    isLoading: metaAds.loading || leads.isLoading || conversations.isLoading,
    metaAds: metaAds.totals,
    leads: leads.kpis,
    conversations: conversations.stats,
  };
}
