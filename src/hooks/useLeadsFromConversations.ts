import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MIN_DATA_DATE } from '@/lib/constants';
import { toBrasiliaDateString } from '@/lib/dateUtils';

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
}

export interface KanbanColumn {
  stage: LeadStage;
  leads: LeadFromConversation[];
}

// Map tag to stage
const mapTagToStage = (tag: string | null): LeadStage => {
  if (!tag) return 'novo_lead';
  
  const normalizedTag = tag.toLowerCase().trim();
  
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
  
  return 'novo_lead'; // default
};

// Map stage back to tag
const mapStageToTag = (stage: LeadStage): string => {
  switch (stage) {
    case 'novo_lead': return 'T1 - Novo Lead';
    case 'qualificacao': return 'T2 - Qualificando';
    case 'qualificados': return 'T3 - Qualificado';
    case 'descartados': return 'T5 - Desqualificado';
    case 'followup': return 'Follow-up Concluído';
    default: return 'T1 - Novo Lead';
  }
};

export const useLeadsFromConversations = (
  workspaceId: string,
  startDate?: Date,
  endDate?: Date
) => {
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
    if (!workspaceId) return;
    
    console.log('🔍 Fetching leads with filters:', { 
      workspaceId, 
      startDate: startDate?.toISOString(), 
      endDate: endDate?.toISOString() 
    });
    
    setIsLoading(true);
    setError(null);

    try {
      // Resolver tabela por workspace
      const { data: ws } = await supabase
        .from('workspaces')
        .select('slug,name')
        .eq('id', workspaceId)
        .maybeSingle();

      const tableName = ws?.slug === 'asf' ? 'conversas_asf' : ws?.slug === 'sieg' ? 'conversas_sieg_financeiro' : 'historico_conversas';
      // SEMPRE usar created_at como campo de data de entrada do lead
      const dateField = 'created_at';
      const workspaceField = tableName === 'historico_conversas' ? 'workspace_id' : 'id_workspace';

      // Fetch conversations with minimum date filter
      let query = (supabase.from as any)(tableName)
        .select('*')
        .eq(workspaceField, workspaceId)
        .gte(dateField, MIN_DATA_DATE)
        .order(dateField, { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Usar função utilitária para converter datas para horário de Brasília
      const toDateStr = toBrasiliaDateString;

      // Filter by date in JavaScript - apply MIN_DATA_DATE and user filters
      let filteredData = data || [];
      
      // Aplicar filtro de data mínima do sistema
      filteredData = filteredData.filter(conv => {
        const dateValue = conv.created_at; // SEMPRE usar created_at
        const convDate = toDateStr(dateValue);
        if (!convDate) return false;
        return convDate >= MIN_DATA_DATE;
      });
      
      // Aplicar filtros de data do usuário (se fornecidos)
      if (startDate || endDate) {
        const startStr = startDate 
          ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}` 
          : null;
        const endStr = endDate 
          ? `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}` 
          : null;
        
        filteredData = filteredData.filter((conv) => {
          const dateValue = conv.created_at; // SEMPRE usar created_at
          const convDate = toDateStr(dateValue);
          if (!convDate) return false;
          if (startStr && convDate < startStr) return false;
          if (endStr && convDate > endStr) return false;
          return true;
        });
      }

      console.log('📊 Fetched leads:', data?.length, '| After date filter:', filteredData.length);

      if (fetchError) throw fetchError;

      const leadsByStage: Record<LeadStage, LeadFromConversation[]> = {
        novo_lead: [],
        qualificacao: [],
        qualificados: [],
        descartados: [],
        followup: [],
      };

      filteredData.forEach((conversation) => {
        const stage = mapTagToStage(conversation.tag);
        
        // SEMPRE usar created_at como data de entrada do lead
        const enteredAt = conversation.created_at || new Date().toISOString();
        
        // Calcular reference_date usando APENAS created_at
        // NUNCA usar updated_at - queremos saber quando o lead ENTROU, não quando foi movido
        const createdStr = toDateStr(conversation.created_at);
        const referenceDate = createdStr || new Date().toISOString().split('T')[0];
        
        const lead: LeadFromConversation = {
          id: conversation.id,
          nome: conversation.lead_name || 'Sem nome',
          telefone: conversation.phone || '',
          produto: '',
          canal_origem: conversation.source || 'nicochat',
          stage,
          entered_at: enteredAt,
          reference_date: referenceDate,
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
  }, [workspaceId, startDate, endDate]);

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
      const newTag = mapStageToTag(toStage);
      // Descobrir tabela alvo para atualização
      const { data: ws2 } = await supabase
        .from('workspaces')
        .select('slug')
        .eq('id', workspaceId)
        .maybeSingle();
      const updateTable = ws2?.slug === 'asf' ? 'conversas_asf' : ws2?.slug === 'sieg' ? 'conversas_sieg_financeiro' : 'historico_conversas';
      const { error: updateError } = await (supabase.from as any)(updateTable)
        .update({ 
          tag: newTag,
          updated_at: new Date().toISOString().split('T')[0]
        })
        .eq('id', leadId);

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

  const kpis = {
    totalLeads,
    qualifiedLeads,
    qualificationRate,
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

  const stageDistribution = columns.map((col) => ({
    name: col.stage === 'novo_lead' ? 'Novo Lead' :
          col.stage === 'qualificacao' ? 'Qualificando' :
          col.stage === 'qualificados' ? 'Qualificados' :
          col.stage === 'descartados' ? 'Desqualificados' : 'Follow-up',
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

  const funnelData = [
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
