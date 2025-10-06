import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  segment?: string;
  logo_url?: string;
  primary_color?: string;
  kpis?: {
    leads: number;
    conversions: number;
    aiEfficiency: number;
    activeConversations: number;
  };
}

export interface CreateWorkspaceData {
  name: string;
  slug: string;
  segment?: string;
  logo_url?: string;
  primary_color?: string;
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch workspaces the user has access to
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (workspacesError) throw workspacesError;

      // Fetch KPIs for each workspace
      const workspacesWithKpis = await Promise.all(
        (workspacesData || []).map(async (workspace) => {
          // Get last 30 days KPIs
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const { data: kpiData } = await supabase
            .rpc('kpi_totais_periodo', {
              p_workspace_id: workspace.id,
              p_from: thirtyDaysAgo.toISOString().split('T')[0],
              p_to: new Date().toISOString().split('T')[0],
            });

          const { data: conversations } = await supabase
            .from('analise_ia')
            .select('id')
            .eq('workspace_id', workspace.id)
            .gte('ended_at', thirtyDaysAgo.toISOString());

          const kpi = kpiData?.[0] || {
            recebidos: 0,
            qualificados: 0,
          };

          return {
            ...workspace,
            kpis: {
              leads: kpi.recebidos || 0,
              conversions: kpi.recebidos > 0 
                ? ((kpi.qualificados / kpi.recebidos) * 100) 
                : 0,
              aiEfficiency: 154, // Mock - would calculate from conversation_summaries
              activeConversations: conversations?.length || 0,
            },
          };
        })
      );

      setWorkspaces(workspacesWithKpis);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkspace = async (data: CreateWorkspaceData) => {
    try {
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert([data])
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Add current user as owner
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error: memberError } = await supabase
          .from('membros_workspace')
          .insert([
            {
              workspace_id: workspace.id,
              user_id: user.id,
              role: 'owner',
            },
          ]);

        if (memberError) throw memberError;
      }

      toast.success('Workspace criada com sucesso!');
      await fetchWorkspaces();
      return workspace;
    } catch (err: any) {
      toast.error('Erro ao criar workspace');
      throw err;
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return {
    workspaces,
    isLoading,
    error,
    refetch: fetchWorkspaces,
    createWorkspace,
  };
}
