import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { MIN_DATA_DATE } from '@/lib/constants';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { useCurrentTenant } from '@/contexts/TenantContext';

export type LeadStage = 'novo_lead' | 'qualificacao' | 'qualificados' | 'descartados' | 'followup';

export interface LeadKanban {
  id: number;
  nome: string;
  telefone: string;
  produto: string;
  canal_origem: string;
  stage: LeadStage;
  entered_at: string;
}

export interface KanbanColumn {
  id: LeadStage;
  title: string;
  leads: LeadKanban[];
}

interface TenantConversationRow {
  id: number;
  tenant_id: string;
  nome?: string;
  lead_name?: string;
  phone?: string;
  produto?: string;
  source?: string;
  tag?: string;
  created_at: string;
}

const STAGES: LeadStage[] = ['novo_lead', 'qualificacao', 'qualificados', 'descartados', 'followup'];

const defaultLabels: Record<LeadStage, string> = {
  novo_lead: 'Novo Lead',
  qualificacao: 'Qualificando',
  qualificados: 'Qualificados',
  descartados: 'Desqualificados',
  followup: 'Follow-up',
};

const siegLabels: Record<LeadStage, string> = {
  novo_lead: 'T1 - Sem Resposta',
  qualificacao: 'T2 - Respondido',
  qualificados: 'T3 - Pago IA',
  descartados: 'T5 - Desqualificado',
  followup: 'T4 - Transferido',
};

const createEmptyColumns = (labels: Record<LeadStage, string>): Record<LeadStage, KanbanColumn> =>
  STAGES.reduce((acc, stage) => ({ ...acc, [stage]: { id: stage, title: labels[stage], leads: [] } }),
  {} as Record<LeadStage, KanbanColumn>);

const mapTagToStage = (tag?: string | null, slug?: string): LeadStage => {
  if (!tag) return 'novo_lead';
  const normalized = tag.toLowerCase();
  if (slug === 'sieg') {
    if (normalized.includes('t4') || normalized.includes('transfer')) return 'followup';
    if (normalized.includes('t3') || normalized.includes('pago')) return 'qualificados';
    if (normalized.includes('t2') || normalized.includes('respond')) return 'qualificacao';
    if (normalized.includes('t5') || normalized.includes('desqual')) return 'descartados';
    return 'novo_lead';
  }
  if (normalized.includes('qualificado') || normalized.includes('t3')) return 'qualificados';
  if (normalized.includes('follow') || normalized.includes('t4')) return 'followup';
  if (normalized.includes('descart') || normalized.includes('t5')) return 'descartados';
  if (normalized.includes('qualific')) return 'qualificacao';
  return 'novo_lead';
};

const mapStageToTag = (stage: LeadStage, slug?: string): string => {
  if (slug === 'sieg') {
    if (stage === 'followup') return 'T4 - transferido';
    if (stage === 'qualificados') return 'T3 - pago ia';
    if (stage === 'qualificacao') return 'T2 - respondido';
    if (stage === 'descartados') return 'T5 - desqualificado';
    return 'T1 - sem resposta';
  }
  if (stage === 'qualificados') return 'qualificado';
  if (stage === 'qualificacao') return 'qualificando';
  if (stage === 'followup') return 'followup';
  if (stage === 'descartados') return 'desqualificado';
  return 'novo_lead';
};

const normalizeLead = (row: TenantConversationRow, slug?: string): LeadKanban | null => {
  const stage = mapTagToStage(row.tag, slug);
  const enteredAt = row.created_at ?? new Date().toISOString();
  if (!row.phone) return null;
  return {
    id: row.id,
    nome: row.nome || row.lead_name || 'Sem nome',
    telefone: row.phone,
    produto: row.produto || '',
    canal_origem: row.source || 'nicochat',
    stage,
    entered_at: enteredAt,
  };
};

const buildDailySeries = (leads: LeadKanban[], onlyQualified = false) => {
  const start = new Date(MIN_DATA_DATE);
  const end = new Date();
  const totals: Record<string, number> = {};
  const current = new Date(start);
  while (current <= end) {
    totals[current.toISOString().split('T')[0]] = 0;
    current.setDate(current.getDate() + 1);
  }
  leads
    .filter((lead) => (onlyQualified ? lead.stage === 'qualificados' : true))
    .forEach((lead) => {
      const day = lead.entered_at.split('T')[0];
      if (totals[day] !== undefined) totals[day] += 1;
    });
  return Object.entries(totals)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([day, value]) => ({ day: day.split('-').reverse().slice(0, 2).join('/'), value }));
};

export function useLeadsKanban(_workspaceId: string, startDate?: Date, endDate?: Date) {
  const { tenant, isLoading: tenantLoading } = useCurrentTenant();
  const [columns, setColumns] = useState<Record<LeadStage, KanbanColumn>>(() => createEmptyColumns(defaultLabels));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setColumns(createEmptyColumns(tenant?.slug === 'sieg' ? siegLabels : defaultLabels));
  }, [tenant?.slug]);

  const fetchLeads = useCallback(async () => {
    if (tenantLoading) return;
    if (!tenant) {
      setColumns(createEmptyColumns(defaultLabels));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = (centralSupabase.from as any)('tenant_conversations')
        .select('id, tenant_id, nome, lead_name, phone, produto, source, tag, created_at')
        .eq('tenant_id', tenant.id)
        .gte('created_at', `${MIN_DATA_DATE}T00:00:00`)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (startDate) {
        query = query.gte('created_at', `${startDate.toISOString().split('T')[0]}T00:00:00`);
      }
      if (endDate) {
        const endNext = new Date(endDate);
        endNext.setDate(endNext.getDate() + 1);
        query = query.lt('created_at', `${endNext.toISOString().split('T')[0]}T00:00:00`);
      }

      const { data, error: leadsError } = await query;
      if (leadsError) throw leadsError;

      const labels = tenant.slug === 'sieg' ? siegLabels : defaultLabels;
      const grouped = STAGES.reduce<Record<LeadStage, LeadKanban[]>>((acc, stage) => {
        acc[stage] = [];
        return acc;
      }, {} as Record<LeadStage, LeadKanban[]>);

      (data || [])
        .map((row: TenantConversationRow) => normalizeLead(row, tenant.slug))
        .filter((lead): lead is LeadKanban => Boolean(lead))
        .forEach((lead) => grouped[lead.stage].push(lead));

      setColumns(
        STAGES.reduce((acc, stage) => ({
          ...acc,
          [stage]: { id: stage, title: labels[stage], leads: grouped[stage] },
        }), {} as Record<LeadStage, KanbanColumn>)
      );
    } catch (err: any) {
      setError(err.message ?? 'Erro ao carregar leads');
      toast.error('Erro ao carregar leads');
      logger.error('Error fetching kanban leads:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantLoading, tenant?.id, tenant?.slug, startDate, endDate]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const moveLead = async (
    leadId: number,
    fromStage: LeadStage,
    toStage: LeadStage,
    fromIndex: number,
    toIndex: number
  ) => {
    const labels = tenant?.slug === 'sieg' ? siegLabels : defaultLabels;
    const current = structuredClone(columns);
    const source = current[fromStage].leads;
    const [lead] = source.splice(fromIndex, 1);
    current[fromStage].leads = source;
    const destination = fromStage === toStage ? source : current[toStage].leads;
    destination.splice(toIndex, 0, { ...lead, stage: toStage });
    setColumns(current);

    try {
      const { error: updateError } = await (centralSupabase as any)
        .from('tenant_conversations')
        .update({ tag: mapStageToTag(toStage, tenant?.slug), updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .eq('tenant_id', tenant?.id || '');

      if (updateError) throw updateError;
      toast.success(`Lead movido para ${labels[toStage]}`);
    } catch (err) {
      logger.error('Error moving lead:', err);
      toast.error('Erro ao mover lead');
      setColumns(columns); // rollback
    }
  };

  const allLeads = useMemo(() => STAGES.flatMap((stage) => columns[stage].leads), [columns]);
  const kpis = useMemo(() => {
    const totalLeads = allLeads.length;
    const qualifiedLeads = columns.qualificados.leads.length;
    return {
      totalLeads,
      qualifiedLeads,
      qualificationRate: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0,
    };
  }, [allLeads.length, columns.qualificados.leads.length]);

  const stageLabels = tenant?.slug === 'sieg' ? siegLabels : defaultLabels;
  const stageDistribution = useMemo(
    () =>
      STAGES.map((stage) => ({
        name: stageLabels[stage],
        value: columns[stage].leads.length,
      })),
    [columns, stageLabels]
  );

  const charts = useMemo(() => ({
    dailyLeads: buildDailySeries(allLeads),
    stageDistribution,
    dailyQualified: buildDailySeries(allLeads.filter((lead) => lead.stage === 'qualificados'), true),
    funnelData:
      tenant?.slug === 'sieg'
        ? [
            { id: 'novo_lead', label: stageLabels.novo_lead, value: columns.novo_lead.leads.length },
            { id: 'qualificacao', label: stageLabels.qualificacao, value: columns.qualificacao.leads.length },
            { id: 'qualificados', label: stageLabels.qualificados, value: columns.qualificados.leads.length },
            { id: 'followup', label: stageLabels.followup, value: columns.followup.leads.length },
          ]
        : [
            { id: 'novo_lead', label: stageLabels.novo_lead, value: columns.novo_lead.leads.length },
            { id: 'qualificacao', label: stageLabels.qualificacao, value: columns.qualificacao.leads.length },
            { id: 'qualificados', label: stageLabels.qualificados, value: columns.qualificados.leads.length },
            { id: 'followup', label: stageLabels.followup, value: columns.followup.leads.length },
            { id: 'descartados', label: stageLabels.descartados, value: columns.descartados.leads.length },
          ],
  }), [allLeads, columns, stageDistribution, stageLabels, tenant?.slug]);

  return {
    columns,
    isLoading,
    error,
    moveLead,
    refetch: fetchLeads,
    kpis,
    charts,
  };
}
