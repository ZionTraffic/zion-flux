import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type LeadStage = 'novo_lead' | 'qualificacao' | 'qualificados' | 'descartados' | 'followup';

export interface LeadFromConversation {
  id: number;
  nome: string;
  telefone: string;
  produto: string;
  canal_origem: string;
  stage: LeadStage;
  entered_at: string;
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
  
  // T3 + T4 - Qualificados (soma de ambos)
  if (normalizedTag.includes('t3') || normalizedTag.includes('qualificado')) return 'qualificados';
  if (normalizedTag.includes('t4') || normalizedTag.includes('agendamento')) return 'qualificados';
  
  // T5 - Desqualificados
  if (normalizedTag.includes('t5') || normalizedTag.includes('desqualificado')) return 'descartados';
  
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

  // Helper to parse dates from started_at (text field)
  const parseStartedAt = (startedAt: string): Date | null => {
    if (!startedAt) return null;
    
    // Try ISO format first (YYYY-MM-DD or full ISO)
    if (startedAt.includes('-') && /^\d{4}-/.test(startedAt)) {
      return new Date(startedAt);
    }
    
    // Try Brazilian format (DD/MM/YYYY)
    if (startedAt.includes('/')) {
      const [day, month, year] = startedAt.split('/');
      if (day && month && year) {
        return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      }
    }
    
    return null;
  };

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
      // Fetch all conversations without date filtering in SQL
      // We'll filter in JS to handle both created_at and started_at
      let query = supabase
        .from('historico_conversas')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Filter by date in JavaScript to handle both created_at and started_at
      let filteredData = data || [];
      
      if (startDate || endDate) {
        const startStr = startDate ? startDate.toISOString().split('T')[0] : null;
        const endStr = endDate ? endDate.toISOString().split('T')[0] : null;
        
        filteredData = filteredData.filter((conv) => {
          const dateStr = conv.created_at || conv.started_at;
          if (!dateStr) return false;
          
          // Extract just the date part (YYYY-MM-DD)
          let convDate: string;
          if (typeof dateStr === 'string') {
            convDate = dateStr.split('T')[0];
          } else {
            convDate = dateStr;
          }
          
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
        
        // Use created_at if available, otherwise parse started_at
        let enteredAt = new Date().toISOString();
        if (conversation.created_at) {
          enteredAt = conversation.created_at;
        } else if (conversation.started_at) {
          const parsedDate = parseStartedAt(conversation.started_at);
          enteredAt = parsedDate ? parsedDate.toISOString() : new Date().toISOString();
        }
        
        const lead: LeadFromConversation = {
          id: conversation.id,
          nome: conversation.lead_name || 'Sem nome',
          telefone: conversation.phone || '',
          produto: '',
          canal_origem: conversation.source || 'nicochat',
          stage,
          entered_at: enteredAt,
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
      const { error: updateError } = await supabase
        .from('historico_conversas')
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

  // Chart data
  const dailyLeads = allLeads.reduce((acc, lead) => {
    const day = lead.entered_at.split('T')[0];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stageDistribution = columns.map((col) => ({
    name: col.stage === 'novo_lead' ? 'Novo Lead' :
          col.stage === 'qualificacao' ? 'Qualificando' :
          col.stage === 'qualificados' ? 'Qualificados' :
          col.stage === 'descartados' ? 'Desqualificados' : 'Follow-up',
    value: col.leads.length,
  }));

  const dailyQualified = columns
    .filter((col) => col.stage === 'qualificados')
    .flatMap((col) => col.leads)
    .reduce((acc, lead) => {
      const day = lead.entered_at.split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const funnelData = [
    { id: 'novo_lead', label: 'Novo Lead', value: columns.find(c => c.stage === 'novo_lead')?.leads.length || 0 },
    { id: 'qualificacao', label: 'Qualificando', value: columns.find(c => c.stage === 'qualificacao')?.leads.length || 0 },
    { id: 'qualificados', label: 'Qualificados', value: columns.find(c => c.stage === 'qualificados')?.leads.length || 0 },
    { id: 'followup', label: 'Follow-up', value: columns.find(c => c.stage === 'followup')?.leads.length || 0 },
    { id: 'descartados', label: 'Desqualificados', value: columns.find(c => c.stage === 'descartados')?.leads.length || 0 },
  ];

  const charts = {
    dailyLeads: Object.entries(dailyLeads)
      .sort(([dayA], [dayB]) => new Date(dayB).getTime() - new Date(dayA).getTime())
      .map(([day, value]) => ({ 
        day: day.split('-').reverse().join('-'),
        value 
      })),
    stageDistribution,
    dailyQualified: Object.entries(dailyQualified)
      .sort(([dayA], [dayB]) => new Date(dayB).getTime() - new Date(dayA).getTime())
      .map(([day, value]) => ({ 
        day: day.split('-').reverse().join('-'),
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
