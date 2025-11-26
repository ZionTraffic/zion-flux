import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { useCurrentTenant } from '@/contexts/TenantContext';
import { useTagMappings } from '@/hooks/useTagMappings';
import { MIN_DATA_DATE_OBJ } from '@/lib/constants';
import {
  LeadStage,
  STAGES,
  resolveLabels,
  fetchTenantLeads,
  parseFinanceValue,
  buildDailyCounter,
  toStartOfDayIso,
  buildEndExclusiveIso,
  ensureReferenceDate,
  LeadFromConversation,
} from './useLeadsShared';

export interface LeadKanban extends LeadFromConversation {}

export interface KanbanColumn {
  id: LeadStage;
  title: string;
  description: string;
  leads: LeadKanban[];
}

const createEmptyColumns = (labels: Record<LeadStage, { title: string; description: string }>) =>
  STAGES.reduce((acc, stage) => {
    acc[stage] = { id: stage, title: labels[stage].title, description: labels[stage].description, leads: [] };
    return acc;
  }, {} as Record<LeadStage, KanbanColumn>);

export function useLeadsKanban(_workspaceId: string, startDate?: Date, endDate?: Date) {
  const { tenant, isLoading: tenantLoading } = useCurrentTenant();
  const { getStageFromTag, loading: mappingsLoading } = useTagMappings(tenant?.id || null);

  const [columns, setColumns] = useState<Record<LeadStage, KanbanColumn>>(() => createEmptyColumns(resolveLabels()));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stageLabels = useMemo(() => resolveLabels(tenant?.slug), [tenant?.slug]);

  useEffect(() => {
    setColumns((prev) =>
      STAGES.reduce((acc, stage) => {
        acc[stage] = {
          id: stage,
          title: stageLabels[stage].title,
          description: stageLabels[stage].description,
          leads: prev[stage]?.leads || [],
        };
        return acc;
      }, {} as Record<LeadStage, KanbanColumn>)
    );
  }, [stageLabels]);

  const fetchLeads = useCallback(async () => {
    if (tenantLoading || !tenant) return;

    setIsLoading(true);
    setError(null);

    try {
      const effectiveStart = startDate && startDate > MIN_DATA_DATE_OBJ ? startDate : MIN_DATA_DATE_OBJ;
      const effectiveEnd = endDate ?? new Date();
      const startISO = toStartOfDayIso(effectiveStart);
      const endISO = buildEndExclusiveIso(effectiveEnd);

      const { columns: columnsMap } = await fetchTenantLeads({
        supabaseClient: centralSupabase,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        startISO,
        endISO,
        getStageFromTag,
        mappingsLoading,
      });

      setColumns(
        STAGES.reduce((acc, stage) => {
          acc[stage] = {
            id: stage,
            title: stageLabels[stage].title,
            description: stageLabels[stage].description,
            leads: columnsMap[stage],
          };
          return acc;
        }, {} as Record<LeadStage, KanbanColumn>)
      );
    } catch (err) {
      console.error('Erro ao buscar leads Kanban:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar leads');
    } finally {
      setIsLoading(false);
    }
  }, [tenantLoading, tenant, startDate, endDate, getStageFromTag, mappingsLoading, stageLabels]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const moveLead = useCallback(async (
    leadId: number,
    fromStage: LeadStage,
    toStage: LeadStage,
    fromIndex: number,
    toIndex: number
  ) => {
    const previous = columns;

    const movingLead = columns[fromStage]?.leads.find((lead) => lead.id === leadId);
    if (!movingLead) return;

    setColumns((prev) => {
      const updated = { ...prev };
      const sourceLeads = [...updated[fromStage].leads];
      sourceLeads.splice(fromIndex, 1);

      const targetLeads = [...(fromStage === toStage ? sourceLeads : updated[toStage].leads)];
      targetLeads.splice(toIndex, 0, { ...movingLead, stage: toStage });

      updated[fromStage] = { ...updated[fromStage], leads: sourceLeads };
      updated[toStage] = { ...updated[toStage], leads: targetLeads };

      return updated;
    });

    try {
      const { error: updateError } = await (centralSupabase.from as any)('leads')
        .update({ stage: toStage, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .eq('workspace_id', tenant?.id || '');

      if (updateError) throw updateError;

      await (centralSupabase.from as any)('historico_leads').insert({
        lead_id: leadId,
        workspace_id: tenant?.id || '',
        from_stage: fromStage,
        to_stage: toStage,
        changed_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Erro ao mover lead:', err);
      setColumns(previous);
      setError(err instanceof Error ? err.message : 'Erro ao mover lead');
    }
  }, [columns, tenant?.id]);

  const allLeads = useMemo(() => STAGES.flatMap((stage) => columns[stage].leads), [columns]);

  const kpis = useMemo(() => {
    const totalLeads = allLeads.length;
    const qualifiedLeads = columns.qualificados.leads.length;
    const valorTotalPendente = allLeads.reduce((sum, lead) => sum + parseFinanceValue(lead.valor_em_aberto), 0);

    return {
      totalLeads,
      qualifiedLeads,
      qualificationRate: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0,
      valorTotalPendente,
    };
  }, [allLeads, columns]);

  const stageDistribution = useMemo(
    () =>
      STAGES.map((stage) => ({
        name: stageLabels[stage].title,
        value: columns[stage].leads.length,
      })),
    [columns, stageLabels]
  );

  const charts = useMemo(() => {
    const dailyTotals = buildDailyCounter();
    const dailyQualifiedTotals = buildDailyCounter();

    allLeads.forEach((lead) => {
      const day = ensureReferenceDate(lead.reference_date)?.split('T')[0] || lead.reference_date.split('T')[0];
      if (dailyTotals[day] !== undefined) dailyTotals[day] += 1;
      if (lead.stage === 'qualificados' && dailyQualifiedTotals[day] !== undefined) dailyQualifiedTotals[day] += 1;
    });

    const buildChart = (serie: Record<string, number>) =>
      Object.entries(serie)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .map(([day, value]) => ({ day: day.split('-').reverse().slice(0, 2).join('/'), value }));

    const funnelData = STAGES.map((stage) => ({
      id: stage,
      label: stageLabels[stage].title,
      value: columns[stage].leads.length,
    }));

    return {
      dailyLeads: buildChart(dailyTotals),
      dailyQualified: buildChart(dailyQualifiedTotals),
      stageDistribution,
      funnelData,
    };
  }, [allLeads, columns, stageLabels, stageDistribution]);

  return {
    columns,
    isLoading,
    error,
    moveLead,
    refetch: fetchLeads,
    kpis,
    charts,
    stageLabels,
  };
}
