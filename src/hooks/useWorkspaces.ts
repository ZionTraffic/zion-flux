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

      // Buscar todas as configurações de banco
      const { data: dbConfigs, error: dbConfigsError } = await supabase
        .from('database_configs')
        .select('*')
        .eq('active', true);

      if (dbConfigsError) throw dbConfigsError;
      if (!dbConfigs || dbConfigs.length === 0) {
        throw new Error('Nenhuma configuração de banco encontrada');
      }

      // Buscar workspaces de cada banco configurado
      const allWorkspacesPromises = dbConfigs.map(async (config) => {
        try {
          const dbClient = createSupabaseClient(
            config.url,
            config.anon_key,
            `sb-${config.database_key}-auth-token`
          );

          const { data, error } = await dbClient
            .from('workspaces')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error(`Error fetching workspaces from ${config.database_key}:`, error);
            return [];
          }

          // Adicionar informação do banco a cada workspace
          return (data || []).map(ws => ({
            ...ws,
            database: config.database_key as 'asf' | 'sieg'
          }));
        } catch (err) {
          console.error(`Error with database ${config.database_key}:`, err);
          return [];
        }
      });

      const allWorkspacesArrays = await Promise.all(allWorkspacesPromises);
      const allWorkspaces = allWorkspacesArrays.flat();

      // Filtrar workspaces onde o usuário é membro
      const workspacesWithAccessPromises = allWorkspaces.map(async (workspace) => {
        try {
          const dbConfig = dbConfigs.find(c => c.database_key === workspace.database);
          if (!dbConfig) return null;

          const dbClient = createSupabaseClient(
            dbConfig.url,
            dbConfig.anon_key,
            `sb-${dbConfig.database_key}-auth-token`
          );

          const { data: accessData } = await dbClient
            .from('membros_workspace')
            .select('role')
            .eq('workspace_id', workspace.id)
            .eq('user_id', session.user.id)
            .maybeSingle();

          return accessData ? workspace : null;
        } catch (err) {
          console.error(`Error checking access for workspace ${workspace.id}:`, err);
          return null;
        }
      });

      const workspacesWithAccess = await Promise.all(workspacesWithAccessPromises);
      const validWorkspaces = workspacesWithAccess.filter((ws): ws is Workspace => ws !== null);

      // Buscar KPIs para cada workspace
      const workspacesWithKpis = await Promise.all(
        validWorkspaces.map(async (workspace) => {
          try {
            // Get last 30 days KPIs
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const dbConfig = dbConfigs.find(c => c.database_key === workspace.database);
            if (!dbConfig) return workspace;

            const dbClient = createSupabaseClient(
              dbConfig.url,
              dbConfig.anon_key,
              `sb-${dbConfig.database_key}-auth-token`
            );

            const { data: kpiData } = await dbClient
              .rpc('kpi_totais_periodo', {
                p_workspace_id: workspace.id,
                p_from: thirtyDaysAgo.toISOString().split('T')[0],
                p_to: new Date().toISOString().split('T')[0],
              });

            const { data: conversations } = await dbClient
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
          } catch (err) {
            console.error(`Error fetching KPIs for workspace ${workspace.id}:`, err);
            return {
              ...workspace,
              kpis: {
                leads: 0,
                conversions: 0,
                aiEfficiency: 0,
                activeConversations: 0,
              },
            };
          }
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
