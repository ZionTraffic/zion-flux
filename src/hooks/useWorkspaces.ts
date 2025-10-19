import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  database: 'asf' | 'sieg';
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
  database: string;
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão não encontrada');

      // Buscar workspaces do usuário diretamente do banco
      const { data: memberWorkspaces, error: memberError } = await supabase
        .from('membros_workspace')
        .select(`
          workspace_id,
          role,
          workspaces (
            id,
            name,
            slug,
            database,
            created_at,
            segment,
            logo_url,
            primary_color
          )
        `)
        .eq('user_id', session.user.id);

      if (memberError) {
        console.error('Error fetching workspaces:', memberError);
        throw memberError;
      }

      // Transformar dados e buscar KPIs
      const workspacesData = await Promise.all(
        (memberWorkspaces || []).map(async (member: any) => {
          const workspace = member.workspaces;
          if (!workspace) return null;

          // Buscar KPIs dos últimos 30 dias
          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
          const toDate = now.toISOString().split('T')[0];

          try {
            const { data: kpiData } = await supabase.rpc('kpi_totais_periodo', {
              p_workspace_id: workspace.id,
              p_from: fromDate,
              p_to: toDate,
            });

            const kpi = kpiData?.[0];

            return {
              ...workspace,
              kpis: kpi ? {
                leads: kpi.recebidos || 0,
                conversions: kpi.qualificados || 0,
                aiEfficiency: kpi.recebidos > 0 ? Math.round((kpi.qualificados / kpi.recebidos) * 100) : 0,
                activeConversations: kpi.followup || 0,
              } : undefined,
            };
          } catch (kpiError) {
            console.error('Error fetching KPIs:', kpiError);
            return workspace;
          }
        })
      );

      const validWorkspaces = workspacesData.filter((ws): ws is Workspace => ws !== null);
      setWorkspaces(validWorkspaces);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkspace = async (data: CreateWorkspaceData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão não encontrada');

      // Chamar edge function para criar workspace
      const { data: workspace, error } = await supabase.functions.invoke(
        'create-workspace',
        {
          body: data
        }
      );

      if (error) throw error;

      toast.success(`Workspace criada com sucesso!`);
      await fetchWorkspaces();
      
      // Disparar evento para recarregar seletor
      window.dispatchEvent(new Event('workspace-created'));
      
      return workspace;
    } catch (err: any) {
      console.error('Error creating workspace:', err);
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
