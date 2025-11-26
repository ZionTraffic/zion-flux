import { useState, useEffect } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { useCurrentTenant } from '@/contexts/TenantContext';
import { useTagMappings } from '@/hooks/useTagMappings';
import { MIN_DATA_DATE_OBJ } from '@/lib/constants';
import {
  toStartOfDayIso,
  buildEndExclusiveIso,
  extractPrimaryTag,
  normalizeStage,
} from '@/hooks/useLeadsShared';
import { logger } from '@/utils/logger';

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
  const { getStageFromTag, loading: mappingsLoading } = useTagMappings(tenant?.id || null);
  const [data, setData] = useState<GlobalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobalData = async () => {
    if (tenantLoading || mappingsLoading) return;
    if (!tenant) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const today = new Date();
      const thirtyDaysAgo = subDays(today, 30);
      const effectiveStart = thirtyDaysAgo > MIN_DATA_DATE_OBJ ? thirtyDaysAgo : MIN_DATA_DATE_OBJ;
      const startISO = toStartOfDayIso(effectiveStart);
      const endISO = buildEndExclusiveIso(today);

      // Usar tenant atual como workspace único
      const workspacesData = [{ id: tenant.id, name: tenant.name, tenant_id: tenant.id }];

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

      const dateRangeDays = eachDayOfInterval({ start: effectiveStart, end: today }).map(date => format(date, 'dd/MM'));

      const workspacePerformances = await Promise.all(
        workspacesData.map(async (workspace: any) => {
          try {
            const { data: leadsData, error: leadsError } = await (centralSupabase.from as any)
              ('leads')
              .select('id, criado_em, status, tags_atuais, metadados')
              .eq('empresa_id', tenant.id)
              .eq('workspace_id', workspace.id)
              .gte('criado_em', startISO)
              .lt('criado_em', endISO)
              .limit(50000);

            if (leadsError) throw leadsError;

            const leads = leadsData || [];
            const normalized = leads.map((lead: any) => {
              const inferredTag = extractPrimaryTag(lead.metadados, lead.tags_atuais);
              const mappedStage = inferredTag && getStageFromTag ? getStageFromTag(inferredTag) : undefined;
              const stage = normalizeStage(mappedStage ?? lead.status, tenant.slug, inferredTag);
              return {
                id: lead.id,
                createdAt: lead.criado_em,
                stage,
              };
            });

            const totalLeads = normalized.length;
            const conversions = normalized.filter((lead) => lead.stage === 'qualificados').length;
            const dailyMap = new Map<string, number>();

            normalized.forEach((lead) => {
              const dayKey = format(new Date(lead.createdAt), 'dd/MM');
              dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + 1);
            });

            const dailyData = dateRangeDays.map(day => ({ day, leads: dailyMap.get(day) || 0 }));

            return {
              workspaceId: workspace.id,
              workspaceName: workspace.name,
              leads: totalLeads,
              conversions,
              spend: 0,
              cpl: conversions > 0 ? 0 : 0,
              dailyData,
            };
          } catch (wsError) {
            logger.error('Erro ao montar métricas globais por workspace', {
              workspaceId: workspace.id,
              error: wsError,
            });
            throw wsError;
          }
        })
      );

      const totalLeads = workspacePerformances.reduce((sum, w) => sum + w.leads, 0);
      const totalConversions = workspacePerformances.reduce((sum, w) => sum + w.conversions, 0);
      const avgConversion = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;

      const chartData = dateRangeDays.map((day) => {
        const row: { day: string; [workspaceName: string]: number | string } = { day };
        workspacePerformances.forEach((workspace) => {
          const dailyEntry = workspace.dailyData.find(entry => entry.day === day);
          row[workspace.workspaceName] = dailyEntry ? dailyEntry.leads : 0;
        });
        return row;
      });

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
      logger.error('Erro ao carregar dados globais', { error: err });
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
  }, [tenantLoading, tenant?.id, mappingsLoading, getStageFromTag]);

  return { data, isLoading, error, refetch: fetchGlobalData };
}
