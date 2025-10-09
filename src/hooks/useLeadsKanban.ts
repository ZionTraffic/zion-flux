import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

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

export function useLeadsKanban(workspaceId: string, startDate?: Date, endDate?: Date) {
  const [columns, setColumns] = useState<Record<LeadStage, KanbanColumn>>({
    novo_lead: { id: 'novo_lead', title: 'Novo Lead', leads: [] },
    qualificacao: { id: 'qualificacao', title: 'Qualificando', leads: [] },
    qualificados: { id: 'qualificados', title: 'Qualificados', leads: [] },
    descartados: { id: 'descartados', title: 'Desqualificados', leads: [] },
    followup: { id: 'followup', title: 'Follow-up', leads: [] },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    if (!workspaceId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('leads')
        .select('id, nome, telefone, produto, canal_origem, stage, entered_at')
        .eq('workspace_id', workspaceId);

      // Apply date filters if provided
      if (startDate) {
        query = query.gte('entered_at', startDate.toISOString());
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('entered_at', endOfDay.toISOString());
      }

      const { data: leads, error: leadsError } = await query.order('entered_at', { ascending: false });

      if (leadsError) throw leadsError;

      // Group leads by stage
      const grouped: Record<LeadStage, LeadKanban[]> = {
        novo_lead: [],
        qualificacao: [],
        qualificados: [],
        descartados: [],
        followup: [],
      };

      leads?.forEach((lead) => {
        const stage = lead.stage as LeadStage;
        if (grouped[stage]) {
          grouped[stage].push(lead as LeadKanban);
        }
      });

      setColumns({
        novo_lead: { id: 'novo_lead', title: 'Novo Lead', leads: grouped.novo_lead },
        qualificacao: { id: 'qualificacao', title: 'Qualificando', leads: grouped.qualificacao },
        qualificados: { id: 'qualificados', title: 'Qualificados', leads: grouped.qualificados },
        descartados: { id: 'descartados', title: 'Desqualificados', leads: grouped.descartados },
        followup: { id: 'followup', title: 'Follow-up', leads: grouped.followup },
      });
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar leads');
      logger.error('Error fetching leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const moveLead = async (
    leadId: number,
    fromStage: LeadStage,
    toStage: LeadStage,
    fromIndex: number,
    toIndex: number
  ) => {
    // Optimistic update
    const sourceColumn = columns[fromStage];
    const destColumn = columns[toStage];
    const sourceLeads = [...sourceColumn.leads];
    const destLeads = fromStage === toStage ? sourceLeads : [...destColumn.leads];

    const [movedLead] = sourceLeads.splice(fromIndex, 1);
    destLeads.splice(toIndex, 0, { ...movedLead, stage: toStage });

    setColumns({
      ...columns,
      [fromStage]: { ...sourceColumn, leads: sourceLeads },
      [toStage]: { ...destColumn, leads: destLeads },
    });

    try {
      // Update lead stage in database
      const { error: updateError } = await supabase
        .from('leads')
        .update({ 
          stage: toStage,
          entered_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (updateError) throw updateError;

      // Log stage change in historico_leads (will be handled by trigger)
      toast.success(`Lead movido para ${destColumn.title}`);
    } catch (err: any) {
      // Revert on error
      toast.error('Erro ao mover lead');
      logger.error('Error moving lead:', err);
      await fetchLeads(); // Refetch to restore correct state
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [workspaceId, startDate, endDate]);

  // Calculate KPIs
  const totalLeads = Object.values(columns).reduce((acc, col) => acc + col.leads.length, 0);
  const qualifiedLeads = columns.qualificados.leads.length;
  const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

  // Aggregate data for charts
  const allLeads = Object.values(columns).flatMap(col => col.leads);
  
  // Daily leads (group by entered_at date)
  const dailyLeadsMap = new Map<string, number>();
  allLeads.forEach(lead => {
    const date = new Date(lead.entered_at).toISOString().split('T')[0];
    dailyLeadsMap.set(date, (dailyLeadsMap.get(date) || 0) + 1);
  });
  const dailyLeads = Array.from(dailyLeadsMap.entries())
    .map(([day, value]) => ({ day, value }))
    .sort((a, b) => a.day.localeCompare(b.day));

  // Stage distribution
  const stageDistributionMap = new Map<string, number>();
  const stageLabels: Record<LeadStage, string> = {
    'novo_lead': 'Novo Lead',
    'qualificacao': 'Qualificando',
    'qualificados': 'Qualificados',
    'descartados': 'Desqualificados',
    'followup': 'Follow-up'
  };
  allLeads.forEach(lead => {
    const label = stageLabels[lead.stage] || lead.stage;
    stageDistributionMap.set(label, (stageDistributionMap.get(label) || 0) + 1);
  });
  const stageDistribution = Array.from(stageDistributionMap.entries())
    .map(([name, value]) => ({ name, value }));

  // Daily qualified (group qualified leads by entered_at)
  const qualifiedLeadsData = allLeads.filter(l => l.stage === 'qualificados');
  const dailyQualifiedMap = new Map<string, number>();
  qualifiedLeadsData.forEach(lead => {
    const date = new Date(lead.entered_at).toISOString().split('T')[0];
    dailyQualifiedMap.set(date, (dailyQualifiedMap.get(date) || 0) + 1);
  });
  const dailyQualified = Array.from(dailyQualifiedMap.entries())
    .map(([day, value]) => ({ day, value }))
    .sort((a, b) => a.day.localeCompare(b.day));

  // Funnel data - must be exactly 5 stages as a tuple
  const funnelData: [
    { id: string; label: string; value: number },
    { id: string; label: string; value: number },
    { id: string; label: string; value: number },
    { id: string; label: string; value: number },
    { id: string; label: string; value: number }
  ] = [
    { 
      id: 'stage-1', 
      label: 'Novo Lead', 
      value: columns.novo_lead.leads.length 
    },
    { 
      id: 'stage-2', 
      label: 'Qualificando', 
      value: columns.qualificacao.leads.length
    },
    { 
      id: 'stage-3', 
      label: 'Qualificados', 
      value: qualifiedLeads 
    },
    { 
      id: 'stage-4', 
      label: 'Desqualificados', 
      value: columns.descartados.leads.length
    },
    { 
      id: 'stage-5', 
      label: 'Follow-up', 
      value: columns.followup.leads.length
    }
  ];

  return {
    columns,
    isLoading,
    error,
    moveLead,
    refetch: fetchLeads,
    kpis: {
      totalLeads,
      qualifiedLeads,
      qualificationRate,
    },
    charts: {
      dailyLeads,
      stageDistribution,
      dailyQualified,
      funnelData,
    },
  };
}
