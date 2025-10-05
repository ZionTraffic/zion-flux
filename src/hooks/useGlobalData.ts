import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

export interface GlobalKpis {
  totalLeads: number;
  avgConversion: number;
  avgCpl: number;
  avgAiEfficiency: number;
  activeConversations: number;
}

export interface WorkspacePerformance {
  workspaceId: string;
  workspaceName: string;
  leads: number;
  conversions: number;
  spend: number;
  cpl: number;
  dailyData: Array<{
    day: string;
    leads: number;
  }>;
}

export interface GlobalData {
  kpis: GlobalKpis;
  workspaces: WorkspacePerformance[];
  chartData: Array<{
    day: string;
    [key: string]: number | string;
  }>;
}

export function useGlobalData() {
  const [data, setData] = useState<GlobalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobalData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const from = format(thirtyDaysAgo, 'yyyy-MM-dd');
      const to = format(new Date(), 'yyyy-MM-dd');

      // Fetch all workspaces
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select('*')
        .order('name');

      if (workspacesError) throw workspacesError;

      if (!workspacesData || workspacesData.length === 0) {
        setData({
          kpis: {
            totalLeads: 0,
            avgConversion: 0,
            avgCpl: 0,
            avgAiEfficiency: 0,
            activeConversations: 0,
          },
          workspaces: [],
          chartData: [],
        });
        setIsLoading(false);
        return;
      }

      // Fetch KPIs for each workspace
      const workspacePerformances = await Promise.all(
        workspacesData.map(async (workspace) => {
          const { data: kpiData } = await supabase
            .rpc('kpi_totais_periodo', {
              p_workspace_id: workspace.id,
              p_from: from,
              p_to: to,
            });

          const { data: dailyData } = await supabase
            .from('kpi_overview_daily')
            .select('day, leads_recebidos')
            .eq('workspace_id', workspace.id)
            .gte('day', from)
            .lte('day', to)
            .order('day', { ascending: true });

          const kpi = kpiData?.[0] || {
            recebidos: 0,
            qualificados: 0,
            investimento: 0,
            cpl: 0,
          };

          return {
            workspaceId: workspace.id,
            workspaceName: workspace.name,
            leads: kpi.recebidos || 0,
            conversions: kpi.qualificados || 0,
            spend: typeof kpi.investimento === 'string' 
              ? parseFloat(kpi.investimento) 
              : kpi.investimento || 0,
            cpl: typeof kpi.cpl === 'string' 
              ? parseFloat(kpi.cpl) 
              : kpi.cpl || 0,
            dailyData: dailyData?.map(d => ({
              day: format(new Date(d.day), 'dd/MM'),
              leads: d.leads_recebidos || 0,
            })) || [],
          };
        })
      );

      // Calculate global KPIs
      const totalLeads = workspacePerformances.reduce((sum, w) => sum + w.leads, 0);
      const totalConversions = workspacePerformances.reduce((sum, w) => sum + w.conversions, 0);
      const totalSpend = workspacePerformances.reduce((sum, w) => sum + w.spend, 0);
      const avgConversion = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;
      const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

      // Get active conversations count
      const { data: conversations } = await supabase
        .from('conversation_summaries')
        .select('id')
        .gte('ended_at', format(new Date(), 'yyyy-MM-dd'));

      // Prepare chart data (merge all workspaces by day)
      const chartDataMap = new Map<string, any>();
      workspacePerformances.forEach(workspace => {
        workspace.dailyData.forEach(day => {
          if (!chartDataMap.has(day.day)) {
            chartDataMap.set(day.day, { day: day.day });
          }
          const existing = chartDataMap.get(day.day);
          existing[workspace.workspaceName] = day.leads;
        });
      });

      const chartData = Array.from(chartDataMap.values());

      setData({
        kpis: {
          totalLeads,
          avgConversion,
          avgCpl,
          avgAiEfficiency: 141, // Mock - would calculate from conversation_summaries
          activeConversations: conversations?.length || 0,
        },
        workspaces: workspacePerformances,
        chartData,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchGlobalData, 60000);
    return () => clearInterval(interval);
  }, []);

  return { data, isLoading, error, refetch: fetchGlobalData };
}
