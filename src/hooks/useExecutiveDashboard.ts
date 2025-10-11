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

export interface QualificationMetrics {
  invested: number;
  qualifiedLeads: number;
  cpl: number;
  qualificationRate: number;
  investedTrend: number;
  qualifiedTrend: number;
  cplTrend: number;
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

  // Calcular métricas de qualificação
  const qualificationMetrics: QualificationMetrics = useMemo(() => {
    const invested = metaAds.totals?.spend || 0;
    const qualifiedLeads = leads.kpis?.qualifiedLeads || 0;
    const totalLeads = leads.kpis?.totalLeads || 0;
    
    // CPL = Custo por Lead Qualificado
    const cpl = qualifiedLeads > 0 ? invested / qualifiedLeads : 0;
    
    // Taxa de Qualificação
    const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

    return {
      invested,
      qualifiedLeads,
      cpl,
      qualificationRate,
      investedTrend: 15, // Mock - calcular com dados históricos
      qualifiedTrend: 23,
      cplTrend: -8, // Negativo = melhoria (custo diminuiu)
    };
  }, [metaAds.totals, leads.kpis]);

  // Determinar saúde do negócio baseado em qualificação
  const businessHealth: BusinessHealth = useMemo(() => {
    const cpl = qualificationMetrics.cpl;
    const qualificationRate = qualificationMetrics.qualificationRate;

    // Meta: CPL < R$ 50 e Taxa > 30%
    if (cpl < 50 && cpl > 0 && qualificationRate > 30) {
      return { status: 'healthy', score: 95 };
    } 
    // Atenção: CPL R$ 50-100 ou Taxa 15-30%
    else if (cpl < 100 && qualificationRate > 15) {
      return { status: 'warning', score: 65 };
    } 
    // Crítico: CPL > R$ 100 ou Taxa < 15%
    else {
      return { status: 'critical', score: 30 };
    }
  }, [qualificationMetrics.cpl, qualificationMetrics.qualificationRate]);

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
    const qualificationRate = qualificationMetrics.qualificationRate;
    if (qualificationRate < 25) {
      alertsList.push({
        id: 'low-qualification',
        type: 'warning',
        title: 'Taxa de qualificação abaixo da meta',
        description: `${qualificationRate.toFixed(1)}% de qualificação (meta: 25%). Leads podem não estar sendo bem trabalhados.`,
        action: 'Qualificar Leads',
      });
    }

    // Alerta de CPL alto
    const cpl = qualificationMetrics.cpl;
    if (cpl > 80) {
      alertsList.push({
        id: 'high-cpl',
        type: 'critical',
        title: 'Custo por lead qualificado elevado',
        description: `R$ ${cpl.toFixed(2)} por lead qualificado. Meta: < R$ 50.`,
        action: 'Otimizar Tráfego',
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
  }, [metaAds.totals, qualificationMetrics, conversations.stats]);

  // Dados do funil de qualificação (5 estágios)
  const funnelData: FunnelStage[] = useMemo(() => {
    const impressions = metaAds.totals?.impressions || 0;
    const clicks = metaAds.totals?.clicks || 0;
    const conversas = metaAds.totals?.conversas_iniciadas || 0;
    const totalLeads = leads.kpis?.totalLeads || 0;
    const qualifiedLeads = leads.kpis?.qualifiedLeads || 0;

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
        name: 'Conversas Iniciadas',
        value: conversas,
        conversionRate: conversas > 0 ? (totalLeads / conversas) * 100 : 0,
        benchmark: 70,
      },
      {
        name: 'Leads Recebidos',
        value: totalLeads,
        conversionRate: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0,
        benchmark: 30,
        isBottleneck: totalLeads > 0 && (qualifiedLeads / totalLeads) * 100 < 20,
      },
      {
        name: 'Leads Qualificados',
        value: qualifiedLeads,
      },
    ];
  }, [metaAds.totals, leads.kpis]);

  // Top campanhas por CPL (menor custo por lead qualificado)
  const topCampaigns = useMemo(() => {
    const conversasEstimadas = metaAds.totals?.conversas_iniciadas || 0;
    const clicksTotal = metaAds.totals?.clicks || 1;
    const conversaoRate = clicksTotal > 0 ? conversasEstimadas / clicksTotal : 0.5;
    const qualificationRate = qualificationMetrics.qualificationRate || 30;

    return (metaAds.campaigns || [])
      .map(campaign => {
        const estimatedConversas = campaign.clicks * conversaoRate;
        const estimatedLeadsQualificados = estimatedConversas * (qualificationRate / 100);
        const cpl = estimatedLeadsQualificados > 0 
          ? campaign.spend / estimatedLeadsQualificados 
          : 999999;

        return {
          ...campaign,
          cpl,
          leadsQualificados: Math.round(estimatedLeadsQualificados),
        };
      })
      .sort((a, b) => a.cpl - b.cpl) // Menor CPL primeiro
      .slice(0, 3);
  }, [metaAds.campaigns, metaAds.totals, qualificationMetrics.qualificationRate]);

  const worstCampaign = useMemo(() => {
    const conversasEstimadas = metaAds.totals?.conversas_iniciadas || 0;
    const clicksTotal = metaAds.totals?.clicks || 1;
    const conversaoRate = clicksTotal > 0 ? conversasEstimadas / clicksTotal : 0.5;
    const qualificationRate = qualificationMetrics.qualificationRate || 30;

    return (metaAds.campaigns || [])
      .map(campaign => {
        const estimatedConversas = campaign.clicks * conversaoRate;
        const estimatedLeadsQualificados = estimatedConversas * (qualificationRate / 100);
        const cpl = estimatedLeadsQualificados > 0 
          ? campaign.spend / estimatedLeadsQualificados 
          : 999999;

        return {
          ...campaign,
          cpl,
          leadsQualificados: Math.round(estimatedLeadsQualificados),
        };
      })
      .sort((a, b) => b.cpl - a.cpl)[0]; // Pior CPL
  }, [metaAds.campaigns, metaAds.totals, qualificationMetrics.qualificationRate]);

  return {
    businessHealth,
    qualificationMetrics,
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
