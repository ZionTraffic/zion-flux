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
      if (!session) {
        console.log('❌ No session found');
        throw new Error('Sessão não encontrada');
      }

      console.log('👤 User session:', { userId: session.user.id, email: session.user.email });

      // 1) Buscar apenas os IDs das workspaces do usuário
      const { data: memberRows, error: memberError } = await supabase
        .from('membros_workspace')
        .select('workspace_id, role')
        .eq('user_id', session.user.id);

      if (memberError) {
        console.error('Error fetching member rows:', memberError);
        throw memberError;
      }

      console.log('🏢 Debug Workspaces - Member rows:', memberRows);
      console.log('🏢 Member rows length:', memberRows?.length || 0);

      const workspaceIds = (memberRows || []).map((r: any) => r.workspace_id);
      console.log('🏢 Workspace IDs:', workspaceIds);
      
      if (workspaceIds.length === 0) {
        console.log('❌ No workspace IDs found, setting empty array');
        setWorkspaces([]);
        return;
      }

      // 2) Buscar detalhes das workspaces em uma segunda query
      const { data: wsRows, error: wsError } = await supabase
        .from('workspaces')
        .select('id, name, slug, database, created_at')
        .in('id', workspaceIds);

      if (wsError) {
        console.error('Error fetching workspace details:', wsError);
        throw wsError;
      }

      // Mapear roles por workspace
      const rolesByWs = new Map<string, string>();
      (memberRows || []).forEach((r: any) => rolesByWs.set(r.workspace_id, r.role));

      // 3) Transformar dados e buscar KPIs
      const workspacesData = await Promise.all(
        (wsRows || []).map(async (workspace: any) => {
          // Se não for ASF, não há KPIs de Meta Ads — retorna sem KPIs
          if (workspace.database !== 'asf') {
            return { ...workspace, role: rolesByWs.get(workspace.id) } as any;
          }

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
              role: rolesByWs.get(workspace.id),
              kpis: kpi ? {
                leads: kpi.recebidos || 0,
                conversions: kpi.qualificados || 0,
                aiEfficiency: kpi.recebidos > 0 ? Math.round((kpi.qualificados / kpi.recebidos) * 100) : 0,
                activeConversations: kpi.followup || 0,
              } : undefined,
            } as any;
          } catch (kpiError) {
            console.error('Error fetching KPIs:', kpiError);
            // Em caso de erro no RPC, retorna sem KPIs para não quebrar a UI
            return { ...workspace, role: rolesByWs.get(workspace.id) } as any;
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
