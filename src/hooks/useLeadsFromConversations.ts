import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { MIN_DATA_DATE_OBJ } from '@/lib/constants';
import { useCurrentTenant } from '@/contexts/TenantContext';
import { useTagMappings } from '@/hooks/useTagMappings';
import {
  LeadStage,
  STAGES,
  resolveLabels,
  buildDailyCounter,
  toStartOfDayIso,
  buildEndExclusiveIso,
  ensureReferenceDate,
  fetchTenantLeads,
  LeadFromConversation,
  parseFinanceValue,
} from './useLeadsShared';

export interface KanbanColumn {
  stage: LeadStage;
  leads: LeadFromConversation[];
}

export const useLeadsFromConversations = (
  _workspaceId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const { tenant, isLoading: tenantLoading } = useCurrentTenant();
  const { getStageFromTag, loading: mappingsLoading } = useTagMappings(tenant?.id || null);

  const [columns, setColumns] = useState<KanbanColumn[]>(() => STAGES.map((stage) => ({ stage, leads: [] })));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stageLabels = useMemo(() => resolveLabels(tenant?.slug), [tenant?.slug]);

  const fetchLeads = useCallback(async () => {
    console.log('🔄 [fetchLeads] Iniciando...', { tenantLoading, hasTenant: !!tenant });
    
    if (tenantLoading || !tenant) {
      console.log('⏸️ [fetchLeads] Pulando - tenant não disponível');
      setIsLoading(false);
      return;
    }

    console.log('✅ [fetchLeads] Buscando leads para tenant:', tenant.id);
    setIsLoading(true);
    setError(null);

    try {
      const effectiveStart = startDate && startDate > MIN_DATA_DATE_OBJ ? startDate : MIN_DATA_DATE_OBJ;
      const effectiveEnd = endDate ?? new Date();
      const startISO = toStartOfDayIso(effectiveStart);
      const endISO = buildEndExclusiveIso(effectiveEnd);

      console.log('📅 [fetchLeads] Período:', { startISO, endISO });

      const { columns: fetchedColumns, leads: fetchedLeads } = await fetchTenantLeads({
        supabaseClient: centralSupabase,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        startISO,
        endISO,
        getStageFromTag,
        mappingsLoading,
      });

      console.log('📦 [fetchLeads] Dados recebidos:', {
        totalLeads: fetchedLeads.length,
        columnCounts: Object.entries(fetchedColumns).map(([stage, leads]) => ({ stage, count: leads.length }))
      });

      setColumns(
        STAGES.map((stage) => ({
          stage,
          leads: fetchedColumns[stage] ?? [],
        }))
      );
    } catch (err) {
      console.error('❌ [fetchLeads] Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar leads');
    } finally {
      setIsLoading(false);
    }
  }, [tenantLoading, tenant, startDate, endDate, mappingsLoading, getStageFromTag]);

  useEffect(() => {
    console.log('🎯 [useEffect] Verificando se deve buscar leads:', {
      tenantLoading,
      hasTenant: !!tenant,
      tenantId: tenant?.id,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString()
    });
    
    // Chamar fetchLeads apenas quando tenant estiver disponível e não estiver carregando
    if (!tenantLoading && tenant) {
      console.log('✅ [useEffect] Chamando fetchLeads...');
      fetchLeads();
    } else {
      console.log('⏸️ [useEffect] Não chamando fetchLeads');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id, startDate, endDate, tenantLoading]);

  const moveLead = useCallback(async (leadId: string, fromStage: LeadStage, toStage: LeadStage) => {
    const previous = columns;

    const leadToMove = previous
      .find((column) => column.stage === fromStage)
      ?.leads.find((lead) => lead.id === leadId);

    if (!leadToMove) return;

    setColumns((prev) =>
      prev.map((column) => {
        if (column.stage === fromStage) {
          const remaining = column.leads.filter((lead) => lead.id !== leadId);
          const updatedLeads = fromStage === toStage
            ? [...remaining, { ...leadToMove, stage: toStage }]
            : remaining;
          return { ...column, leads: updatedLeads };
        } else if (column.stage === toStage) {
          return { ...column, leads: [...column.leads, { ...leadToMove, stage: toStage }] };
        }

        return column;
      })
    );

    try {
      const { error: updateError } = await (centralSupabase.from as any)('leads')
        .update({ stage: toStage, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .eq('empresa_id', tenant?.id || '');

      if (updateError) throw updateError;

      await (centralSupabase.from as any)('historico_leads').insert({
        lead_id: leadId,
        empresa_id: tenant?.id || '',
        from_stage: fromStage,
        to_stage: toStage,
        changed_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error updating lead stage:', err);
      setColumns(previous);
      setError(err instanceof Error ? err.message : 'Erro ao mover lead');
    }
  }, [columns, tenant?.id]);

  const allLeads = useMemo(() => columns.flatMap((column) => column.leads), [columns]);

  const kpis = useMemo(() => {
    const totalLeads = allLeads.length;
    const qualifiedLeads = columns.find((column) => column.stage === 'qualificados')?.leads.length ?? 0;

    console.log('📊 [useLeadsFromConversations] Calculando KPIs:', {
      totalLeads,
      qualifiedLeads,
      allLeadsCount: allLeads.length,
      columnsCount: columns.length,
      leadsPerColumn: columns.map(c => ({ stage: c.stage, count: c.leads.length }))
    });

    const valorTotalPendente = allLeads.reduce((sum, lead) => sum + parseFinanceValue(lead.valor_em_aberto), 0);
    const valorRecuperadoIA = allLeads.reduce((sum, lead) => sum + parseFinanceValue(lead.valor_recuperado_ia), 0);
    const valorRecuperadoHumano = allLeads.reduce((sum, lead) => sum + parseFinanceValue(lead.valor_recuperado_humano), 0);

    return {
      totalLeads,
      qualifiedLeads,
      qualificationRate: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0,
      valorTotalPendente,
      valorRecuperadoIA,
      valorRecuperadoHumano,
      valorTotalRecuperado: valorRecuperadoIA + valorRecuperadoHumano,
    };
  }, [allLeads, columns]);

  const charts = useMemo(() => {
    const dailyTotals = buildDailyCounter();
    const dailyQualifiedTotals = buildDailyCounter();

    allLeads.forEach((lead) => {
      const day = lead.reference_date.split('T')[0];
      if (dailyTotals[day] !== undefined) dailyTotals[day] += 1;
      if (lead.stage === 'qualificados' && dailyQualifiedTotals[day] !== undefined) dailyQualifiedTotals[day] += 1;
    });

    const buildChart = (serie: Record<string, number>) =>
      Object.entries(serie)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .map(([day, value]) => ({ day: day.split('-').reverse().slice(0, 2).join('/'), value }));

    const stageDistribution = columns.map((column) => ({
      name: stageLabels[column.stage].title,
      value: column.leads.length,
    }));

    const funnelData = STAGES.map((stage) => ({
      id: stage,
      label: stageLabels[stage].title,
      value: columns.find((column) => column.stage === stage)?.leads.length ?? 0,
    }));

    return {
      dailyLeads: buildChart(dailyTotals),
      dailyQualified: buildChart(dailyQualifiedTotals),
      stageDistribution,
      funnelData,
    };
  }, [allLeads, columns, stageLabels]);

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
};
