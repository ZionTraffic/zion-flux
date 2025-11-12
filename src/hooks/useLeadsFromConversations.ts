import { useState, useEffect, useCallback } from 'react';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { MIN_DATA_DATE } from '@/lib/constants';
import { toBrasiliaDateString } from '@/lib/dateUtils';
import { useCurrentTenant } from '@/contexts/TenantContext';
import { useTagMappings } from '@/hooks/useTagMappings';

export type LeadStage = 'novo_lead' | 'qualificacao' | 'qualificados' | 'descartados' | 'followup';

export interface LeadFromConversation {
  id: number;
  nome: string;
  telefone: string;
  produto: string;
  canal_origem: string;
  stage: LeadStage;
  entered_at: string;
  reference_date: string;
  // Campos financeiros SIEG
  valor_em_aberto?: string | null;
  valor_recuperado_ia?: string | null;
  valor_recuperado_humano?: string | null;
}

export interface KanbanColumn {
  stage: LeadStage;
  leads: LeadFromConversation[];
}

interface TenantConversationRow {
  id: number;
  tenant_id: string;
  nome?: string;
  lead_name?: string;
  phone?: string;
  tag?: string;
  source?: string;
  produto?: string;
  messages?: any;
  created_at: string;
  updated_at?: string;
  // Campos financeiros SIEG
  valor_em_aberto?: string;
  valor_recuperado_ia?: string;
  valor_recuperado_humano?: string;
}

// Map tag to stage
const mapTagToStage = (tag: string | null, workspaceSlug?: string): LeadStage => {
  if (!tag) return 'novo_lead';
  
  const normalizedTag = tag.toLowerCase().trim();
  const isSieg = workspaceSlug === 'sieg' || workspaceSlug === 'sieg-pre-vendas';
  const isASF = workspaceSlug === 'asf';
  
  if (isSieg) {
    // SIEG FINANCEIRO - Regras específicas
    // T2 - RESPONDIDO: Disparo enviado e cliente respondeu à IA (interação inicial)
    if (
      normalizedTag.includes('t2') ||
      normalizedTag.includes('respondido') ||
      normalizedTag.includes('respondeu')
    ) {
      return 'qualificacao';
    }

    // T1 - SEM RESPOSTA: Lead entrou mas não respondeu nenhuma mensagem da IA
    if (normalizedTag.includes('t1') || normalizedTag.includes('sem resposta') || normalizedTag.includes('prelive')) return 'novo_lead';
    
    // T3 - PAGO IA: Cliente confirmou pagamento ou enviou comprovante para a IA
    if (normalizedTag.includes('t3') || normalizedTag.includes('pago ia') || normalizedTag.includes('pago')) return 'qualificados';
    
    // T4 - TRANSFERIDO: Cliente foi transferido para atendimento humano da SIEG
    if (normalizedTag.includes('t4') || normalizedTag.includes('transferido')) return 'followup';
    
    // T5 - Desqualificados
    if (normalizedTag.includes('t5') || normalizedTag.includes('desqualificado')) return 'descartados';
  } else if (isASF) {
    // ASF FINANCE - Regras específicas
    // T1 - Novo Lead
    if (normalizedTag.includes('t1') || normalizedTag.includes('novo lead')) return 'novo_lead';
    
    // T2 - Qualificando
    if (normalizedTag.includes('t2') || normalizedTag.includes('qualificando')) return 'qualificacao';
    
    // T5 - Desqualificados (DEVE VIR ANTES DE "QUALIFICADO")
    if (normalizedTag.includes('t5') || normalizedTag.includes('desqualificado')) return 'descartados';
    
    // T3 - Qualificado
    if (normalizedTag.includes('t3') || normalizedTag.includes('qualificado')) return 'qualificados';
    
    // T4 - Agendamento (também conta como qualificado)
    if (normalizedTag.includes('t4') || normalizedTag.includes('agendamento')) return 'qualificados';
    
    // Follow-up Concluído
    if (normalizedTag.includes('follow up') || normalizedTag.includes('follow-up')) return 'followup';
  } else {
    // OUTROS WORKSPACES - Regras padrão genéricas
    // T1 - Novo Lead
    if (normalizedTag.includes('t1') || normalizedTag.includes('novo lead')) return 'novo_lead';
    
    // T2 - Qualificando
    if (normalizedTag.includes('t2') || normalizedTag.includes('qualificando')) return 'qualificacao';
    
    // T5 - Desqualificados (DEVE VIR ANTES DE "QUALIFICADO")
    if (normalizedTag.includes('t5') || normalizedTag.includes('desqualificado')) return 'descartados';
    
    // T3 + T4 - Qualificados (soma de ambos)
    if (normalizedTag.includes('t3') || normalizedTag.includes('qualificado')) return 'qualificados';
    if (normalizedTag.includes('t4') || normalizedTag.includes('agendamento')) return 'qualificados';
    
    // Follow-up Concluído
    if (normalizedTag.includes('follow up') || normalizedTag.includes('follow-up')) return 'followup';
  }
  
  return 'novo_lead'; // default
};

// Map stage back to tag
const mapStageToTag = (stage: LeadStage, workspaceSlug?: string): string => {
  const isSieg = workspaceSlug === 'sieg' || workspaceSlug === 'sieg-pre-vendas';
  const isASF = workspaceSlug === 'asf';
  
  if (isSieg) {
    // SIEG FINANCEIRO - Labels específicos
    switch (stage) {
      case 'novo_lead': return 'T1 - Sem Resposta';
      case 'qualificacao': return 'T2 - Respondido';
      case 'qualificados': return 'T3 - Pago IA';
      case 'followup': return 'T4 - Transferido';
      case 'descartados': return 'T5 - Desqualificado';
      default: return 'T1 - Sem Resposta';
    }
  } else if (isASF) {
    // ASF FINANCE - Labels específicos
    switch (stage) {
      case 'novo_lead': return 'T1 - Novo Lead';
      case 'qualificacao': return 'T2 - Qualificando';
      case 'qualificados': return 'T3 - Qualificado';
      case 'descartados': return 'T5 - Desqualificado';
      case 'followup': return 'Follow-up Concluído';
      default: return 'T1 - Novo Lead';
    }
  } else {
    // OUTROS WORKSPACES - Labels padrão genéricos
    switch (stage) {
      case 'novo_lead': return 'T1 - Novo Lead';
      case 'qualificacao': return 'T2 - Qualificando';
      case 'qualificados': return 'T3 - Qualificado';
      case 'descartados': return 'T5 - Desqualificado';
      case 'followup': return 'Follow-up Concluído';
      default: return 'T1 - Novo Lead';
    }
  }
};

export const useLeadsFromConversations = (
  _workspaceId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const { tenant, isLoading: tenantLoading } = useCurrentTenant();
  const { getStageFromTag, getDisplayLabel, loading: mappingsLoading } = useTagMappings(tenant?.id || null);
  
  const [columns, setColumns] = useState<KanbanColumn[]>([
    { stage: 'novo_lead', leads: [] },
    { stage: 'qualificacao', leads: [] },
    { stage: 'qualificados', leads: [] },
    { stage: 'descartados', leads: [] },
    { stage: 'followup', leads: [] },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    if (tenantLoading || !tenant) {
      console.log('⏳ Aguardando tenant antes da busca...');
      return;
    }
    
    console.log('🔍 Fetching tenant leads:', { 
      tenantId: tenant.id,
      startDate: startDate?.toISOString(), 
      endDate: endDate?.toISOString() 
    });
    
    setIsLoading(true);
    setError(null);

    try {
      const dateField = 'created_at';
      const pageSize = 1000;

      let startISO: string | null = null;
      if (startDate) {
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const day = String(startDate.getDate()).padStart(2, '0');
        const startDateStr = `${year}-${month}-${day}`;
        startISO = new Date(`${startDateStr}T00:00:00-03:00`).toISOString();
        console.log('🔍 Start date filter:', { startDate: startISO });
      } else {
        startISO = '2025-01-01T00:00:00-03:00';
        console.log('📅 Usando data mínima: 2025-01-01');
      }

      let endExclusiveISO: string | null = null;
      if (endDate) {
        const endNext = new Date(endDate);
        endNext.setDate(endNext.getDate() + 1);
        const endNextStr = endNext.toISOString().split('T')[0];
        endExclusiveISO = new Date(`${endNextStr}T00:00:00-03:00`).toISOString();
        console.log('🔍 End date exclusive filter:', { endExclusiveISO });
      }

      const paginatedResults: TenantConversationRow[] = [];
      for (let page = 0; page < 200; page++) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        let pageQuery = (centralSupabase as any)
          .from('tenant_conversations')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order(dateField, { ascending: false })
          .range(from, to);

        if (startISO) {
          pageQuery = pageQuery.gte(dateField, startISO);
        }
        if (endExclusiveISO) {
          pageQuery = pageQuery.lt(dateField, endExclusiveISO);
        }

        const { data: pageData, error: fetchError } = await pageQuery;
        if (fetchError) {
          console.error('❌ Erro ao buscar leads:', fetchError);
          throw fetchError;
        }

        if (!pageData || pageData.length === 0) {
          break;
        }

        paginatedResults.push(...pageData as TenantConversationRow[]);

        if (pageData.length < pageSize) {
          break;
        }
      }

      const filteredData = paginatedResults;
      const toDateStr = toBrasiliaDateString;

      console.log('📊 Fetched tenant leads:', filteredData.length);

      const leadsByStage: Record<LeadStage, LeadFromConversation[]> = {
        novo_lead: [],
        qualificacao: [],
        qualificados: [],
        descartados: [],
        followup: [],
      };

      filteredData.forEach((conversation) => {
        // Usar mapeamento do banco de dados (se disponível)
        let stage: LeadStage;
        if (conversation.tag && !mappingsLoading) {
          const mapped = getStageFromTag(conversation.tag) as LeadStage;
          const heuristic = mapTagToStage(conversation.tag ?? null, tenant.slug);
          stage = mapped !== 'novo_lead' ? mapped : heuristic;
        } else {
          stage = mapTagToStage(conversation.tag ?? null, tenant.slug);
        }

        // SEMPRE usar created_at como data de entrada do lead
        const enteredAt = conversation.created_at || new Date().toISOString();
        
        // Calcular reference_date usando APENAS created_at
        // NUNCA usar updated_at - queremos saber quando o lead ENTROU, não quando foi movido
        const createdStr = toDateStr(conversation.created_at);
        const referenceDate = createdStr || new Date().toISOString().split('T')[0];
        
        const lead: LeadFromConversation = {
          id: conversation.id,
          nome: conversation.nome || conversation.lead_name || 'Sem nome',
          telefone: conversation.phone || '',
          produto: conversation.produto || '',
          canal_origem: conversation.source || 'nicochat',
          stage,
          entered_at: enteredAt,
          reference_date: referenceDate,
          // Campos financeiros SIEG
          valor_em_aberto: conversation.valor_em_aberto || null,
          valor_recuperado_ia: conversation.valor_recuperado_ia || null,
          valor_recuperado_humano: conversation.valor_recuperado_humano || null,
        };
        leadsByStage[stage].push(lead);
      });

      setColumns([
        { stage: 'novo_lead', leads: leadsByStage.novo_lead },
        { stage: 'qualificacao', leads: leadsByStage.qualificacao },
        { stage: 'qualificados', leads: leadsByStage.qualificados },
        { stage: 'descartados', leads: leadsByStage.descartados },
        { stage: 'followup', leads: leadsByStage.followup },
      ]);
    } catch (err) {
      console.error('Error fetching leads from conversations:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar leads');
    } finally {
      setIsLoading(false);
    }
  }, [tenantLoading, tenant?.id, tenant?.slug, startDate, endDate]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const moveLead = async (leadId: number, fromStage: LeadStage, toStage: LeadStage) => {
    const previousColumns = [...columns];

    try {
      // Optimistic update
      setColumns((prev) => {
        return prev.map((col) => {
          if (col.stage === fromStage) {
            return { ...col, leads: col.leads.filter((l) => l.id !== leadId) };
          }
          if (col.stage === toStage) {
            const movedLead = previousColumns
              .find((c) => c.stage === fromStage)
              ?.leads.find((l) => l.id === leadId);
            if (movedLead) {
              return { ...col, leads: [...col.leads, { ...movedLead, stage: toStage }] };
            }
          }
          return col;
        });
      });

      // Update database
      const newTag = mapStageToTag(toStage, tenant?.slug);
      const { error: updateError } = await (centralSupabase as any)
        .from('tenant_conversations')
        .update({ 
          tag: newTag,
          updated_at: new Date().toISOString().split('T')[0]
        })
        .eq('id', leadId)
        .eq('tenant_id', tenant?.id || '');

      if (updateError) throw updateError;

    } catch (err) {
      console.error('Error moving lead:', err);
      setColumns(previousColumns);
      setError(err instanceof Error ? err.message : 'Erro ao mover lead');
    }
  };

  // Calculate KPIs
  const allLeads = columns.flatMap((col) => col.leads);
  const totalLeads = allLeads.length;
  const qualifiedLeads = columns
    .filter((col) => col.stage === 'qualificados')
    .flatMap((col) => col.leads).length;
  const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

  // KPIs Financeiros (SIEG)
  const parseValor = (valor?: string | null): number => {
    if (!valor) return 0;
    const cleaned = valor.replace(/[^0-9,.-]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const valorTotalPendente = allLeads.reduce((sum, lead) => 
    sum + parseValor(lead.valor_em_aberto), 0
  );
  
  const valorRecuperadoIA = allLeads.reduce((sum, lead) => 
    sum + parseValor(lead.valor_recuperado_ia), 0
  );
  
  const valorRecuperadoHumano = allLeads.reduce((sum, lead) => 
    sum + parseValor(lead.valor_recuperado_humano), 0
  );
  
  const valorTotalRecuperado = valorRecuperadoIA + valorRecuperadoHumano;

  const kpis = {
    totalLeads,
    qualifiedLeads,
    qualificationRate,
    // KPIs Financeiros
    valorTotalPendente,
    valorRecuperadoIA,
    valorRecuperadoHumano,
    valorTotalRecuperado,
  };

  // Chart data - sempre começar de MIN_DATA_DATE até hoje
  const dailyLeads = (() => {
    const result: Record<string, number> = {};
    
    // ✅ SEMPRE começar de MIN_DATA_DATE (01/10/2025) até hoje
    const startChartDate = new Date(MIN_DATA_DATE);
    const endChartDate = new Date();
    
    let currentDate = new Date(startChartDate);
    while (currentDate <= endChartDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      result[dateStr] = 0; // Inicializar com 0
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Preencher com os leads que temos
    allLeads.forEach(lead => {
      const day = lead.reference_date.split('T')[0];
      if (result.hasOwnProperty(day)) {
        result[day] = result[day] + 1;
      }
    });
    
    return result;
  })();

  const isSieg = tenant?.slug === 'sieg';

  const stageDistribution = columns.map((col) => ({
    name: isSieg 
      ? (col.stage === 'novo_lead' ? 'T1 - Sem Resposta' :
         col.stage === 'qualificacao' ? 'T2 - Respondido' :
         col.stage === 'qualificados' ? 'T3 - Pago IA' :
         col.stage === 'followup' ? 'T4 - Transferido' :
         col.stage === 'descartados' ? 'T5 - Desqualificado' : 'T1 - Sem Resposta')
      : (col.stage === 'novo_lead' ? 'Novo Lead' :
         col.stage === 'qualificacao' ? 'Qualificando' :
         col.stage === 'qualificados' ? 'Qualificados' :
         col.stage === 'descartados' ? 'Desqualificados' : 'Follow-up'),
    value: col.leads.length,
  }));

  const dailyQualified = (() => {
    const result: Record<string, number> = {};
    
    // ✅ SEMPRE começar de MIN_DATA_DATE (01/10/2025) até hoje
    const startChartDate = new Date(MIN_DATA_DATE);
    const endChartDate = new Date();
    
    let currentDate = new Date(startChartDate);
    while (currentDate <= endChartDate) {
      const dayStr = currentDate.toISOString().split('T')[0];
      result[dayStr] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Preencher apenas com leads qualificados
    const qualifiedLeads = columns
      .filter((col) => col.stage === 'qualificados')
      .flatMap((col) => col.leads);
      
    qualifiedLeads.forEach(lead => {
      const day = lead.reference_date.split('T')[0];
      if (result.hasOwnProperty(day)) {
        result[day] = result[day] + 1;
      }
    });
    
    return result;
  })();

  // Obter workspace slug do tenant
  const workspaceSlug = tenant?.slug || '';
  const isASF = workspaceSlug === 'asf';
  
  const funnelData = isSieg ? [
    // SIEG: 4 estágios (sem desqualificados no funil)
    { id: 'novo_lead', label: 'T1 - Sem Resposta', value: columns.find(c => c.stage === 'novo_lead')?.leads.length || 0 },
    { id: 'qualificacao', label: 'T2 - Respondido', value: columns.find(c => c.stage === 'qualificacao')?.leads.length || 0 },
    { id: 'qualificados', label: 'T3 - Pago IA', value: columns.find(c => c.stage === 'qualificados')?.leads.length || 0 },
    { id: 'followup', label: 'T4 - Transferido', value: columns.find(c => c.stage === 'followup')?.leads.length || 0 },
  ] : isASF ? [
    // ASF FINANCE: 5 estágios (com desqualificados no funil)
    { id: 'novo_lead', label: 'T1 - Novo Lead', value: columns.find(c => c.stage === 'novo_lead')?.leads.length || 0 },
    { id: 'qualificacao', label: 'T2 - Qualificando', value: columns.find(c => c.stage === 'qualificacao')?.leads.length || 0 },
    { id: 'qualificados', label: 'T3 - Qualificado', value: columns.find(c => c.stage === 'qualificados')?.leads.length || 0 },
    { id: 'followup', label: 'Follow-up', value: columns.find(c => c.stage === 'followup')?.leads.length || 0 },
    { id: 'descartados', label: 'T5 - Desqualificado', value: columns.find(c => c.stage === 'descartados')?.leads.length || 0 },
  ] : [
    // OUTROS WORKSPACES: 5 estágios padrão
    { id: 'novo_lead', label: 'Novo Lead', value: columns.find(c => c.stage === 'novo_lead')?.leads.length || 0 },
    { id: 'qualificacao', label: 'Qualificando', value: columns.find(c => c.stage === 'qualificacao')?.leads.length || 0 },
    { id: 'qualificados', label: 'Qualificados', value: columns.find(c => c.stage === 'qualificados')?.leads.length || 0 },
    { id: 'followup', label: 'Follow-up', value: columns.find(c => c.stage === 'followup')?.leads.length || 0 },
    { id: 'descartados', label: 'Desqualificados', value: columns.find(c => c.stage === 'descartados')?.leads.length || 0 },
  ];

  const charts = {
    dailyLeads: Object.entries(dailyLeads)
      .sort(([dayA], [dayB]) => new Date(dayA).getTime() - new Date(dayB).getTime())
      .map(([day, value]) => ({
        day: day.split('-').reverse().slice(0, 2).join('/'),
        value
      })),
    stageDistribution,
    dailyQualified: Object.entries(dailyQualified)
      .sort(([dayA], [dayB]) => new Date(dayA).getTime() - new Date(dayB).getTime())
      .map(([day, value]) => ({
        day: day.split('-').reverse().slice(0, 2).join('/'),
        value
      })),
    funnelData,
  };

  return {
    columns,
    isLoading,
    error,
    moveLead,
    refetch: fetchLeads,
    kpis,
    charts,
  };
};
