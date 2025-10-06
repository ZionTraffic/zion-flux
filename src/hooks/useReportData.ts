import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

export interface ReportData {
  workspace: {
    id: string;
    name: string;
  };
  period: {
    from: string;
    to: string;
  };
  kpis: {
    leadsRecebidos: number;
    leadsQualificados: number;
    leadsFollowup: number;
    leadsDescartados: number;
    investimento: number;
    cpl: number;
    taxaConversao: number;
  };
  dailyData: Array<{
    day: string;
    leads: number;
    investment: number;
    cpl: number;
  }>;
  aiMetrics: {
    satisfactionIndex: number;
    avgResponseTime: number;
    trainableCount: number;
    criticalConversations: number;
  };
  insights: string[];
  recommendations: string[];
}

export function useReportData(workspaceId: string, fromDate: Date, toDate: Date) {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const from = format(fromDate, 'yyyy-MM-dd');
        const to = format(toDate, 'yyyy-MM-dd');

        // Fetch KPI totals
        const { data: kpiData, error: kpiError } = await supabase
          .rpc('kpi_totais_periodo', {
            p_workspace_id: workspaceId,
            p_from: from,
            p_to: to,
          });

        if (kpiError) throw kpiError;

        // Fetch daily data
        const { data: dailyData, error: dailyError } = await supabase
          .from('kpi_overview_daily')
          .select('day, leads_recebidos, investimento, cpl')
          .eq('workspace_id', workspaceId)
          .gte('day', from)
          .lte('day', to)
          .order('day', { ascending: true });

        if (dailyError) throw dailyError;

        // Fetch conversation summaries for AI metrics
        const { data: conversations, error: convError } = await supabase
          .from('analise_ia')
          .select('qualified, summary, ended_at')
          .eq('workspace_id', workspaceId)
          .gte('ended_at', from)
          .lte('ended_at', to);

        if (convError) throw convError;

        // Calculate AI metrics (simplified since sentiment/duration not in table)
        const totalConversations = conversations?.length || 0;
        const avgSentiment = 0.7; // Mock value - would need separate sentiment analysis
        const avgDuration = 180; // Mock value - would need duration tracking
        const trainable = Math.floor(totalConversations * 0.3); // Mock: 30% trainable
        const critical = Math.floor(totalConversations * 0.1); // Mock: 10% critical

        // Map workspace name
        const workspaceNames: Record<string, string> = {
          '3f14bb25-0eda-4c58-8486-16b96dca6f9e': 'ASF Finance',
          '4e99af61-d5a2-4319-bd6c-77d31c77b411': 'Bem Estar',
          '8d10ce88-6e33-4822-92aa-cdd2c72d91de': 'Dr. Premium',
        };

        const kpi = kpiData?.[0] || {
          recebidos: 0,
          qualificados: 0,
          followup: 0,
          descartados: 0,
          investimento: 0,
          cpl: 0,
        };

        const reportData: ReportData = {
          workspace: {
            id: workspaceId,
            name: workspaceNames[workspaceId] || 'Workspace',
          },
          period: {
            from,
            to,
          },
          kpis: {
            leadsRecebidos: kpi.recebidos,
            leadsQualificados: kpi.qualificados,
            leadsFollowup: kpi.followup,
            leadsDescartados: kpi.descartados,
            investimento: typeof kpi.investimento === 'string' ? parseFloat(kpi.investimento) : kpi.investimento || 0,
            cpl: typeof kpi.cpl === 'string' ? parseFloat(kpi.cpl) : kpi.cpl || 0,
            taxaConversao: kpi.recebidos > 0 ? (kpi.qualificados / kpi.recebidos) * 100 : 0,
          },
          dailyData: dailyData?.map(d => ({
            day: format(new Date(d.day), 'dd/MM'),
            leads: d.leads_recebidos || 0,
            investment: typeof d.investimento === 'string' ? parseFloat(d.investimento) : d.investimento || 0,
            cpl: typeof d.cpl === 'string' ? parseFloat(d.cpl) : d.cpl || 0,
          })) || [],
          aiMetrics: {
            satisfactionIndex: avgSentiment * 100,
            avgResponseTime: avgDuration,
            trainableCount: trainable,
            criticalConversations: critical,
          },
          insights: generateInsights(kpi, { avgSentiment, avgDuration, trainable, critical }),
          recommendations: generateRecommendations(kpi, { avgSentiment, avgDuration, trainable, critical }),
        };

        setData(reportData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [workspaceId, fromDate, toDate]);

  return { data, isLoading, error };
}

function generateInsights(kpi: any, aiData: any): string[] {
  const insights: string[] = [];

  if (kpi.cpl > 50) {
    insights.push('CPL acima da média do mercado - revisar estratégia de segmentação');
  }

  if (kpi.qualificados / Math.max(kpi.recebidos, 1) < 0.3) {
    insights.push('Taxa de qualificação baixa - melhorar critérios de filtro inicial');
  }

  if (aiData.avgSentiment < 0.5) {
    insights.push('Sentimento geral negativo - ajustar tom e abordagem da IA');
  }

  if (aiData.critical > 5) {
    insights.push(`${aiData.critical} conversas críticas detectadas - análise urgente necessária`);
  }

  return insights;
}

function generateRecommendations(kpi: any, aiData: any): string[] {
  const recommendations: string[] = [];

  if (kpi.followup > kpi.qualificados * 0.5) {
    recommendations.push('Implementar automação de follow-up para reduzir tempo de resposta');
  }

  if (aiData.avgResponseTime > 300) {
    recommendations.push('Otimizar prompt da IA para respostas mais rápidas');
  }

  if (aiData.trainable > 10) {
    recommendations.push('Revisar conversas treináveis para aprimorar base de conhecimento');
  }

  if (kpi.descartados / Math.max(kpi.recebidos, 1) > 0.2) {
    recommendations.push('Refinar segmentação de anúncios para reduzir leads descartados');
  }

  return recommendations;
}
