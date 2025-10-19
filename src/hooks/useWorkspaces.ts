import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createSupabaseClient } from '@/integrations/supabase/client';
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
        .select('*, database')
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
            database: workspace.database as 'asf' | 'sieg',
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
      // Buscar configuração do banco
      const { data: dbConfig } = await supabase
        .from('database_configs')
        .select('*')
        .eq('database_key', data.database)
        .single();

      if (!dbConfig) {
        throw new Error('Configuração de banco não encontrada');
      }

      // Criar client para o banco alvo
      const targetClient = createSupabaseClient(
        dbConfig.url,
        dbConfig.anon_key,
        `sb-${data.database}-workspace`
      );

      // Autenticar
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão não encontrada');

      await targetClient.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });

      // Criar workspace
      const { data: workspace, error: workspaceError } = await targetClient
        .from('workspaces')
        .insert([{
          name: data.name,
          slug: data.slug,
          database: data.database,
          segment: data.segment,
          logo_url: data.logo_url,
          primary_color: data.primary_color
        }])
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Adicionar usuário como owner
      const { error: memberError } = await targetClient
        .from('membros_workspace')
        .insert([{
          workspace_id: workspace.id,
          user_id: session.user.id,
          role: 'owner',
        }]);

      if (memberError) throw memberError;

      toast.success(`Workspace criada no banco ${dbConfig.name}!`);
      await fetchWorkspaces();
      
      // Disparar evento para recarregar seletor
      window.dispatchEvent(new Event('workspace-created'));
      
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
