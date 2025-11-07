import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { useCurrentTenant } from '@/contexts/TenantContext';

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
  const { tenant, isLoading: tenantLoading } = useCurrentTenant();
  const [data, setData] = useState<GlobalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobalData = async () => {
    if (tenantLoading) return;
    if (!tenant) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const from = format(thirtyDaysAgo, 'yyyy-MM-dd');
      const to = format(new Date(), 'yyyy-MM-dd');

      const { data: workspacesData, error: workspacesError } = await (centralSupabase.from as any)
        ('tenant_workspaces')
        .select('id, name, tenant_id')
        .eq('tenant_id', tenant.id)
        .eq('active', true)
        .order('name', { ascending: true });

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

      const workspacePerformances = await Promise.all(
        workspacesData.map(async (workspace: any) => {
          const { data: leadsData, error: leadsError } = await (centralSupabase.from as any)
            ('tenant_conversations')
            .select('created_at, tag')
            .eq('tenant_id', tenant.id)
            .gte('created_at', `${from}T00:00:00`)
            .lte('created_at', `${to}T23:59:59`)
            .limit(5000);

          if (leadsError) throw leadsError;

          const leads = leadsData || [];
          const totalLeads = leads.length;
          const conversions = leads.filter((lead) => {
            const tag = (lead.tag || '').toLowerCase();
            if (tenant.slug === 'sieg') {
              return tag.includes('t3') || tag.includes('pago');
            }
            return tag.includes('qualificado') || tag.includes('t3');
          }).length;

          const dailyMap = new Map<string, number>();
          leads.forEach((lead) => {
            const day = format(new Date(lead.created_at), 'dd/MM');
            dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
          });

          return {
            workspaceId: workspace.id,
            workspaceName: workspace.name,
            leads: totalLeads,
            conversions,
            spend: 0,
            cpl: conversions > 0 ? 0 : 0,
            dailyData: Array.from(dailyMap.entries()).map(([day, count]) => ({ day, leads: count })),
          };
        })
      );

      const totalLeads = workspacePerformances.reduce((sum, w) => sum + w.leads, 0);
      const totalConversions = workspacePerformances.reduce((sum, w) => sum + w.conversions, 0);
      const avgConversion = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;

      const chartDataMap = new Map<string, Record<string, number>>();
      workspacePerformances.forEach((workspace) => {
        workspace.dailyData.forEach((day) => {
          const existing = chartDataMap.get(day.day) || {};
          existing[workspace.workspaceName] = day.leads;
          chartDataMap.set(day.day, existing);
        });
      });

      const chartData: { day: string; [key: string]: string | number }[] = Array.from(chartDataMap.entries()).map(
        ([dayKey, values]) => ({ day: dayKey, ...values })
      );

      setData({
        kpis: {
          totalLeads,
          avgConversion,
          avgCpl: 0,
          avgAiEfficiency: 0,
          activeConversations: 0,
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
  }, [tenantLoading, tenant?.id]);

  return { data, isLoading, error, refetch: fetchGlobalData };
}
